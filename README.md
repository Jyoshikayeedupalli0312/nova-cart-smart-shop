# NovaCart Smarter Local

Build a polished, modern, fully functional web application for the NOVA CART Business Rescue Challenge.



IMPORTANT: Do not create a generic e-commerce website or a static UI mockup. This must be a convincing functional business solution/prototype that demonstrates a clear problem → logic → action → measurable business impact.



1. BUSINESS CONTEXT



NOVA CART is a fictional quick-commerce and local-shopping platform connecting customers with 620 local grocery stores, pharmacies, bakeries, stationery stores and other retailers across 3 Indian cities.



Current situation:



- Registered users: 1,20,000

- Monthly active users: 46,000

- Monthly orders: 38,500

- Average order value: ₹486

- Monthly revenue: ₹26.1 lakh

- Repeat purchase rate has fallen from 41% to 27%

- Average delivery time increased from 29 to 37 minutes

- Cancellation rate increased from 6% to 11%

- Support tickets increased from 3,100 to 5,900/month

- Promotional spending increased from ₹9.5 lakh to ₹17 lakh/month



Customer signals:



- 38% say prices/fees feel higher than expected

- 34% say delivery takes too long

- 29% experience products becoming unavailable after ordering

- 24% find discounts confusing

- 21% prefer purchasing directly from nearby stores

- 18% struggle to discover relevant local products

- 16% experienced refund problems

- 14% feel the app is cluttered

- 11% say delivery tracking is inaccurate



Behavior signals:



- 54% of new users complete their first order

- Only 31% place a second order within 30 days

- Customers completing 3 orders have a 72% probability of ordering again the following month

- Large first-order discounts produce lower long-term retention than organic acquisition

- 44% of promotional coupons are never redeemed

- 19% repeatedly search for unavailable products

- Customers buying across multiple store categories show higher repeat usage



Operational signals:



- 11% of orders are cancelled

- 13% arrive more than 15 minutes after estimated time

- 8% contain substituted items

- 6% require refund/support interaction

- 35% of cancellations are caused by product unavailability

- 27% are caused by delivery delays

- 18% are caused by stores rejecting orders

- 12% are caused by delivery-partner unavailability



Partner-store signals:



- 39% say maintaining online inventory requires too much effort

- 31% believe promotions reduce margins

- 28% struggle to predict online demand

- 23% occasionally reject orders during busy periods

- 18% are considering leaving the platform



Technology currently exists separately:



- Customer mobile application

- Basic website

- Partner-store dashboard

- Order database

- Customer database

- Delivery tracking

- Payment gateway

- Coupon system

- Basic analytics dashboard



The challenge explicitly requires a meaningful functional prototype rather than static screens.



2. PRODUCT DIRECTION



Create a product called:



NOVA CART — Local Commerce Intelligence



Tagline:



“Right Product. Right Store. Right Time.”



The product should address the strongest connected business problems:



1. Low repeat purchase / retention

2. Product availability and inventory inaccuracies

3. Poor local-product discovery

4. Delivery reliability

5. Inefficient promotional spending



Instead of simply giving customers more discounts, build an intelligent system that helps NOVA CART create reliable, personalized and local shopping experiences.



3. CORE PRODUCT CONCEPT



Create an intelligent Local Commerce Recommendation & Operations platform connecting:



CUSTOMER → INVENTORY → STORE → ORDER → DELIVERY → RETENTION



The application should intelligently recommend products and stores based on:



- Customer behavior

- Previous orders

- Product availability

- Store reliability

- Distance

- Estimated delivery time

- Store category

- Customer preferences

- Current promotions

- Inventory confidence

- Order history



The system should avoid recommending products that are likely to be unavailable.



It should also help store partners identify:



- Low-stock products

- Frequently searched unavailable products

- High-demand prod

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://nova-cart-smart-shop.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a8fadb9a-368b-5ea2-903e-341a54c80d5f).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
