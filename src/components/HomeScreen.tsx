import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Button } from 'react-native';
import { RootStackParamList } from './types';

// định nghĩa kiểu (type) cho đối tượng navigation khi bạn đang đứng trong màn hình Home của một Stack Navigator được định nghĩa bởi RootStackParamList
type HomeScreenNavigationProp = NavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  // useNavigation là một hook do thư viện @react-navigation/native
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <Button
      title="Đi đến chi tiết"
      onPress={() => navigation.navigate('Detail', { id: 123 })}
    />
  );
}
