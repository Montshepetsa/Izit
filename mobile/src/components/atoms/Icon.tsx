import { FontAwesome5 } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';

type FaName = ComponentProps<typeof FontAwesome5>['name'];

export function Icon({
  name,
  size = 18,
  color,
  solid = true,
  style,
}: {
  name: FaName;
  size?: number;
  color: string;
  solid?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return <FontAwesome5 name={name} size={size} color={color} solid={solid} style={style} />;
}
