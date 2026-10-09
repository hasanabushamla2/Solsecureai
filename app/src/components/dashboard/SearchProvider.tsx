'use client'
import { createContext, useState } from "react";

interface Search {
    searchQuery: string;
    setSearchQuery:(query:string)=>void;
}

export const SearchContext = createContext<Search|undefined>(undefined)

 export const SearchProvider: React.FC<{children:React.ReactNode}> = ({children})=>{
    const [searchQuery,setSearchQuery]= useState<string>('')

    return (
        <SearchContext.Provider value={{searchQuery,setSearchQuery}}>{children}</SearchContext.Provider>
    )
 }