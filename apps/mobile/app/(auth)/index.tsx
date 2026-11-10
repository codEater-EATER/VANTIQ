import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';

export default function AuthIndex() {
  return (
    <View className="flex-1 bg-[#101827] items-center justify-center p-4">
      <Text className="text-4xl font-bold text-[#F6F2EA] mb-4">VANTIQ</Text>
      <Text className="text-[#F6F2EA]/60 text-center mb-8">Intelligence That Converts</Text>

      <Link href="/(auth)/login" asChild>
        <Button className="w-full mb-4">Sign In</Button>
      </Link>

      <Link href="/(auth)/register" asChild>
        <Button variant="outline" className="w-full">
          Create Account
        </Button>
      </Link>
    </View>
  );
}
