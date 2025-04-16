import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false); // State để kiểm tra xem router đã sẵn sàng chưa

  // Sử dụng useEffect để đảm bảo router sẵn sàng trước khi điều hướng
  useEffect(() => {
    if (isReady) {
      router.replace("/screens/LoginScreen"); // Điều hướng đến trang đăng nhập
    } else {
      setIsReady(true); // Đặt isReady thành true khi router đã sẵn sàng
    }
  }, [isReady, router]);

  return (
    <View className="flex justify-center items-center gap-4">
      <Text className="font-bold text-lg my-10">Welcome to Tixclick</Text>
    </View>
  );
}
