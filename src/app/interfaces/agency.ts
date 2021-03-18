import { Link } from '@app/interfaces/link';

export interface Agency {
    agency_id: number;
    agency_name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    Links: Link[]; 
}
