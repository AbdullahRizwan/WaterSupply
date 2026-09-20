import { Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ReactNode } from 'react';

type DismissKeyboardViewProps = {
  children: ReactNode;
};

export default function DismissKeyboardView({ children }: DismissKeyboardViewProps) {
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>{children}</View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
