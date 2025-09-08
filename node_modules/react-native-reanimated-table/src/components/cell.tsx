import React, { FC, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';

interface CellProps {
  data: React.ReactNode;
  width?: number;
  height?: number;
  flex?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  borderStyle?: {
    borderColor?: string;
    borderWidth?: number;
  };
}

export const Cell: FC<CellProps> = ({
  data,
  width,
  height,
  flex,
  style,
  textStyle,
  borderStyle,
  ...props
}) => {
  const textDom = React.isValidElement(data) ? (
    data
  ) : (
    <Text style={StyleSheet.flatten([textStyle, styles.text])} {...props}>
      {data}
    </Text>
  );

  const borderTopWidth = borderStyle?.borderWidth ?? 0;
  const borderRightWidth = borderTopWidth;
  const borderColor = borderStyle?.borderColor ?? '#000';

  const composedStyles = useMemo(() => {
    const styles: ViewStyle = {};
    if (width) {
      styles.width = width;
    }
    if (height) {
      styles.height = height;
    }
    if (flex) {
      styles.flex = flex;
    }
    if (!width && !flex && !height && !style) {
      styles.flex = 1;
    }
    return styles;
  }, [width, height, flex, style]);

  return (
    <View
      style={StyleSheet.flatten([
        {
          borderTopWidth,
          borderRightWidth,
          borderColor,
        },
        styles.cell,
        composedStyles,
        style,
      ])}
    >
      {textDom}
    </View>
  );
};

const styles = StyleSheet.create({
  cell: { justifyContent: 'center' },
  text: { backgroundColor: 'transparent' },
});
