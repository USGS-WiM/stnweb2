export interface State {
    state_id: number;
    state_name: string;
    state_abbrev: string;
    counties: [];
    selected?: boolean;
}
