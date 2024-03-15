export enum USER_ROLES {
    User = 'User',
    Admin = 'Admin',
    Employee = 'Employee',
}

export enum USER_STATUS {
    Active = 'Active',
    Locked = 'Locked'
}

export enum USER_GENDER {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other'
}

export enum AUTH_TOKENS {
    Active = 'Active',
    Disabled = 'Disabled',
}

export enum PRODUCT_BRAND {
    Nike = 'Nike',
    Vans = 'Vans',
    Puma = 'Puma',
    Adidas = 'Adidas',
    Converse = 'Converse',
    Balenciaga = 'Balenciaga',
}

export enum PRODUCT_STATUS {
    Hide = 'Hide',
    Active = 'Active',
    Locked = 'Locked',
}

export enum VARIANT_COLOR {
    Red = 'Red',
    Blue = 'Blue',
    Gray = 'Gray',
    Cyan = 'Cyan',
    Pink = 'Pink',
    Green = 'Green',
    Black = 'Black',
    White = 'White',
    Brown = 'Brown',
    Purple = 'Purple',
    Yellow = 'Yellow',
    Orange = 'Orange',
    Silver = 'Silver',
}

export enum VARIANT_HEX {
    Red = '#FF0000',
    Blue = '#0000FF',
    Gray = '#808080',
    Cyan = '#00FFFF',
    Pink = '#FFC0CB',
    Green = '#00FF00',
    Black = '#000000',
    White = '#FFFFFF',
    Brown = '#A52A2A',
    Purple = '#800080',
    Yellow = '#FFFF00',
    Orange = '#FFA500',
    Silver = '#C0C0C0',
}

export enum ORDER_PAYMENT_METHOD {
    COD = 'COD',
    VNPAY = 'VNPAY',
}

export enum ORDER_STATUS {
    Cancel = 'Cancel',
    Return = 'Return',
    Accepted = 'Accepted',
    Confirming = 'Confirming',
    Delivering = 'Delivering',
    Successful = 'Successful',
    ReturnSuccessfully = 'ReturnSuccessfully',
    DeliveredSuccessfully = 'DeliveredSuccessfully',
}