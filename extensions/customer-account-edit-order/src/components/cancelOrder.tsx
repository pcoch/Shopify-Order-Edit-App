import {
  Disclosure,
  Pressable,
  Button,
  InlineLayout,
  View,
  Icon,
  Text,
  Banner,
} from "@shopify/ui-extensions-react/customer-account";

interface CancelOrderProps {
  onCancel: () => Promise<void>;
  cancelStatus: {
    success?: boolean;
    error?: string;
  };
}

export default function CancelOrder({
  onCancel,
  cancelStatus,
}: CancelOrderProps) {
  return (
    <Disclosure>
      <Pressable
        border={["none", "none", "base", "none"]}
        toggles="cancel-section"
      >
        <InlineLayout columns={["auto", "fill", "auto"]}>
          <View padding="base">
            <Icon source="error" />
          </View>
          <View padding="base">
            <Text emphasis="bold">Cancel your order</Text>
          </View>
          <View padding="base">
            <Icon source="chevronDown" />
          </View>
        </InlineLayout>
      </Pressable>
      <View padding="base" id="cancel-section">
        <Text>Are you sure you want to cancel your order?</Text>
        <Button onPress={onCancel} loadingLabel="Cancelling order...">
          Cancel Order
        </Button>
        {cancelStatus.success && (
          <Banner status="success">Order cancellation successful</Banner>
        )}
        {cancelStatus.error && (
          <Banner status="critical">{cancelStatus.error}</Banner>
        )}
      </View>
    </Disclosure>
  );
}
