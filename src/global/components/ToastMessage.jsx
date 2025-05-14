import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';
import { FontAwesome5 } from "@expo/vector-icons";

const ToastMessage = ({ message, type = 'normal', position = 'bottom', onHide }) => {
  const { colors, typography } = useThemeContext();

  const [fadeAnim] = useState(new Animated.Value(0));
  const [visible, setVisible] = useState(false);

  // Define styles based on message type (all the same bg for now)
  const toastStyles = {
    normal: { backgroundColor: colors.card },
    success: { backgroundColor: colors.card },
    error: { backgroundColor: colors.card },
    info: { backgroundColor: colors.card },
    record: { backgroundColor: colors.card },
  };

  // Styles based on position
  const positionStyles = {
    top: { top: 20 },
    bottom: { bottom: 20 },
    center: { top: '50%', transform: [{ translateY: '-50%' }] },  // Vertically center
  };

  // Get icon based on message type
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FontAwesome5 name="check-circle" size={24} color={colors.text.success} />;
      case 'error':
        return <FontAwesome5 name="times-circle" size={24} color={colors.text.danger} />;
      case 'info':
        return <FontAwesome5 name="info-circle" size={24} color={colors.text.info} />;
      case 'record':
        return <FontAwesome5 name="trophy" size={24} color={colors.text.warning} />;  // Trophy for 'record'
      default:
        return <FontAwesome5 name="info-circle" size={24} color={colors.text.info} />;
    }
  };

  // Show the toast message
  const handleShowToast = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Hide the toast message
  const handleHideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onHide) onHide();  // Call onHide if provided
    });
  };

  useEffect(() => {
    if (message) {
      handleShowToast();
      setTimeout(() => handleHideToast(), 5000);  // Toast disappears after 5 seconds
    }
  }, [message]);

  if (!visible) return null;  // Do not render if toast is not visible

  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { opacity: fadeAnim }, 
        toastStyles[type || 'info'], 
        positionStyles[position]  // Apply position style
      ]}
    >
      <View style={styles.toastContent}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          {getIcon(type)}
        </View>

        {/* Text */}
        <Text style={[styles.toastText, { color: colors.text.white, ...typography.bodyMedium }]}>
          {message}
        </Text>

        {/* Close button */}
        <TouchableOpacity onPress={handleHideToast}>
          <Text style={[styles.toastClose, { color: colors.text.white }]}>X</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ToastMessage Styles
const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: '5%',
    right: '5%',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  toastContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginRight: 10,  // Space between icon and text
  },
  toastText: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,  // Ensures text takes available space
  },
  toastClose: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ToastMessage;
