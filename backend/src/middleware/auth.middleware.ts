import { Request, Response, NextFunction } from "express";
import { createHash } from "node:crypto";
import pool from "../db";
import { QueryResult } from "pg";

export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const session_token: string = req.cookies.session_token;
    if(!session_token){
        return res.status(401).json({
            error: "Unauthorized: No token found"
        })
    }
    const hash: string = createHash('sha256')
    .update(session_token)
    .digest('hex');


    try{
        const result: QueryResult = await pool.query(
            'select id, wallet_address, created_at, expires_at, revoked_at from auth_sessions where token_hash = $1',
            [hash]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Unauthorized: Invalid session token."
            });
        }
        const resultJson = result.rows[0];
        if(resultJson.expires_at.getTime() <= Date.now() 
            || resultJson.revoked_at !== null){
            return res.status(401).json({
                error: "Unauthorized: Invalid session token."
            });
        }
        res.locals.session = resultJson;
        next();
    }
    catch(error:unknown){
        next(error);
    }
}