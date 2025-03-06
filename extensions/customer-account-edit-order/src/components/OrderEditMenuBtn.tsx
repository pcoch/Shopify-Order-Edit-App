import {
  Button,
  reactExtension,
  useApi,
} from "@shopify/ui-extensions-react/customer-account";

export default reactExtension(
  "customer-account.order.action.menu-item.render",
  () => <MenuActionItemExtension />,
);

function MenuActionItemExtension() {
  const { orderId } =
    useApi<"customer-account.order.action.menu-item.render">();

  const numericOrderId = orderId.split("/").pop();

  return (
    <Button
      to={`extension:edit-order-page/customer-account.order.page.render/${numericOrderId}/`}
      accessibilityLabel="Edit Order"
    >
      Edit Order
    </Button>
  );
}
