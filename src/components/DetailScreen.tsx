import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from './types'; // hoặc nơi bạn khai báo kiểu
import { Text, View } from 'react-native';

//xác định kiểu dữ liệu của route khi bạn muốn truy cập route.params trong một màn hình cụ thể: Detail
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

export default function DetailScreen() {
  const route = useRoute<DetailScreenRouteProp>();

  return (
    <View>
      <Text>ID sản phẩm: {route.params.id}</Text>
    </View>
  );
}
