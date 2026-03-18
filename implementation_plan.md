# Implementation Plan - Unify ABA PayWay Payment Flow in Flutter

The user wants to display the HTML response from the ABA PayWay `purchase` endpoint in their Flutter mobile app for both "ABA KHQR" and "Credit/Debit Card" options. Currently, the "KHQR" option erroneously expects a JSON response, leading to failures when an HTML page is returned.

## Proposed Changes

### [Backend] [e-commerce-node-api](file:///d:/RUPP%20WORK/CS%20Y4/e-commerce-node-api)

#### [MODIFY] [abaPayway.ts](file:///d:/RUPP%20WORK/CS%20Y4/e-commerce-node-api/src/utils/abaPayway.ts)
- Add `generateCofHash` and `getCofPayload` functions based on the Link Card (COF) API documentation.
- The COF payload requires `merchant_id`, `ctid` (user ID), and `return_params`.

#### [MODIFY] [orderController.ts](file:///d:/RUPP%20WORK/CS%20Y4/e-commerce-node-api/src/controllers/orderController.ts)
- Update the `POST /api/v1/orders/:id/payway-payload` endpoint.
- If `paymentOption` is `'cards'`, use `getCofPayload` to hit the `api/payment-gateway/v1/cof/initial` endpoint.
- If `paymentOption` is `'abakhqr'`, continue using the existing `purchase` endpoint flow.

### [Flutter] [e_commerce](file:///d:/RUPP%20WORK/CS%20Y4/e_commerce)

#### [MODIFY] [aba_checkout_screen.dart](file:///d:/RUPP%20WORK/CS%20Y4/e_commerce/lib/screens/orders/aba_checkout_screen.dart)
- Update the checkout logic to handle the different response structure for COF initialization.
- Since COF returns a Card entry form (HTML), ensure [AbaWebViewScreen](file:///d:/RUPP%20WORK/CS%20Y4/e_commerce/lib/screens/orders/aba_webview_screen.dart#6-25) renders it correctly.
- **Workflow Change**: After the card is linked, the app will need to verify the link status before potentially triggering a "Purchase by Token" (if required for one-time orders in this configuration).

## Verification Plan

### Manual Verification
1. Launch the Flutter app on an emulator/device.
2. Navigate to the Checkout screen and select "ABA_PAYWAY" as the payment method.
3. On the [AbaCheckoutScreen](file:///d:/RUPP%20WORK/CS%20Y4/e_commerce/lib/screens/orders/aba_checkout_screen.dart#13-28), select "ABA KHQR".
    - **Expected**: A WebView opens and displays the ABA PayWay KHQR UI (provided by the HTML response from the backend).
4. Go back and select "Credit/Debit Card".
    - **Expected**: A WebView opens and displays the ABA PayWay Card entry UI.
5. In either case, closing the WebView or completing the payment should return the user to the [AbaCheckoutScreen](file:///d:/RUPP%20WORK/CS%20Y4/e_commerce/lib/screens/orders/aba_checkout_screen.dart#13-28) (which then triggers a payment status check).

> [!NOTE]
> Since I cannot run the Flutter app and navigate the UI myself, I will rely on code correctness and the user's manual verification.
