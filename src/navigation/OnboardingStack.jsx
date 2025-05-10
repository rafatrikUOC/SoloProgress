import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding1 from '../features/onboarding/screens/Onboarding1Screen';
import Onboarding2 from '../features/onboarding/screens/Onboarding2Screen';
import Onboarding3 from '../features/onboarding/screens/Onboarding3Screen';
import Onboarding4 from '../features/onboarding/screens/Onboarding4Screen';
import AuthStack from './AuthStack';

const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Onboarding4" component={Onboarding4} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}
