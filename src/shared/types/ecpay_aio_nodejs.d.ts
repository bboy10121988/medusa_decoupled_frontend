declare module 'ecpay_aio_nodejs' {
  export class ecpay_aio {
    constructor(options: {
      OperationMode: string;
      MercProfile: {
        MerchantID: string;
        HashKey: string;
        HashIV: string;
      };
      IgnorePayment: string[];
      IsProjectContractor: boolean;
    });
    
    payment_client: {
      aio_check_out_all: (tradeParams: {
        MerchantTradeNo: string;
        MerchantTradeDate: string;
        PaymentType: string;
        TotalAmount: string;
        TradeDesc: string;
        ItemName: string;
        ReturnURL: string;
        ClientBackURL?: string;
        OrderResultURL?: string;
        ChoosePayment: string;
        EncodeType: string;
        NeedExtraPaidInfo: string;
        CustomField1?: string;
        CustomField2?: string;
        CustomField3?: string;
        CustomField4?: string;
        MerchantID: string;
      }) => string;
    };
  }
}
