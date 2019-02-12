export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    primaryPhone: string;
    secondaryPhone: string;
    agency: string;
    roleID: number;
    salt: string;
    password: string;
    otherInfo: string;
}
