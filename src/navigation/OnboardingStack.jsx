import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Onboarding1 from '../screens/Onboarding/Onboarding1Screen';
import Onboarding2 from '../screens/Onboarding/Onboarding2Screen';
import Onboarding3 from '../screens/Onboarding/Onboarding3Screen';
import Onboarding4 from '../screens/Onboarding/Onboarding4Screen';
  
const Stack = createNativeStackNavigator();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding1" component={Onboarding1} />
      <Stack.Screen name="Onboarding2" component={Onboarding2} />
      <Stack.Screen name="Onboarding3" component={Onboarding3} />
      <Stack.Screen name="Onboarding4" component={Onboarding4} />
    </Stack.Navigator>
  );
}
