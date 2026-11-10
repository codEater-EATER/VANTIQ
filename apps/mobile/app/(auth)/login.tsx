import { View, Text } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginFormData>();

  const onSubmit = (data: LoginFormData) => {
    console.log('Login:', data);
  };

  return (
    <View className="flex-1 bg-[#101827] p-6">
      <Text className="text-3xl font-bold text-[#F6F2EA] mb-8">Sign In</Text>
      {/* Form will be implemented with proper React Native components */}
      <Text className="text-[#F6F2EA]/60">Email and password form goes here</Text>
    </View>
  );
}
