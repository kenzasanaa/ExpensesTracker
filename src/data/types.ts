export interface Expense {
    id : string;
    amount : number;
    description : string;
    category: 'food' | 'transport' | 'housing' | 'entertainment' | 'utilities' | 'other';
    date : string;
    createdAt: string;
}
export interface Incomes {
    id : string;
    amount : number; 
    description : string;
    source : string;
    date : string;
    createdAt: string;
}