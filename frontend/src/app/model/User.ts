const ROLES: string[] = ["cashier", "waiter", "bartender", "cook"];

export interface User {
    username: string,
    name: string,
    surname: string,
    role: string
}

export function isUser(data: User) {
    return data && data.username && typeof(data.username) === "string" && 
    data.name && typeof(data.name) === "string" && 
    data.surname && typeof(data.surname) === "string" && 
    data.role && typeof(data.role) === "string" && ROLES.includes(data.role);
}