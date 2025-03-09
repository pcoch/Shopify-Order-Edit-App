# Shopify Order Edit App

# Functionality

- Customers can make minor edits on the Order Summary page (up to 30 mins after order)
- Customers can make minor AND major edits on the dedicated Order Edit Page
- Minor edits: anything that doesn't require a refund or new invoice - i.e change shipping address, cancel order
- Major edits: anything that requires a refund or new invoice - adjust quantities, change product variants, change shipping, add new items

# Technical Summary

- UI with Checkout UI Extension
- 30 mins countdown is handled by state that is persisted in local storage
- API call by proxying request from UI extension to app server

Purposefully not adding checkout UI extensions. When customers refresh the page they go to the account page where they can edit their order.
Potentially an edit order button on the checkout UI page to navigate them, but likely not neccesary.

#TODO

- Remove the order status page extensions - just keep it all in the one order edit page.
- Add products feature (recommended products)

#Bugs

- When updating from a modal for the first edit, the button will turn to enabled before the modal closes.
