# Shopify Order Edit App

# Functionality

Customers can edit order on the Order Summary page (up to 30 mins after order)

# Technical Summary

- UI with Checkout UI Extension
- 30 mins countdown is handled by state that is persisted in local storage
- API call by proxying request from UI extension to app server

Purposefully not adding checkout UI extensions. When customers refresh the page they go to the account page where they can edit their order.
Potentially an edit order button on the checkout UI page to navigate them, but likely not neccesary.
