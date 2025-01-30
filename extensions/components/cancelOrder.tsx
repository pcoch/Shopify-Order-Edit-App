import {
  Disclosure,
  Pressable,
  InlineLayout,
  View,
  Icon,
  Text,
} from "@shopify/ui-extensions-react/customer-account";

export default function CancelOrder() {
  return (
    <Disclosure>
      <Pressable border={["none", "none", "base", "none"]} toggles="one">
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
      <View padding="base" id="one">
        Are you sure you want to cancel your order?
      </View>
    </Disclosure>
  );
}
