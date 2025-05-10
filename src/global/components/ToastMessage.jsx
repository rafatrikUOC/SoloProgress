import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useThemeContext } from '../contexts/ThemeContext';  // Asegúrate de tener acceso al tema
import { FontAwesome5 } from "@expo/vector-icons";  // Usa FontAwesome5 correctamente

// Componente ToastMessage
const ToastMessage = ({ message, type = 'normal', position = 'bottom', onHide }) => {
  const { colors, typography } = useThemeContext();  // Accede al contexto de temas

  const [fadeAnim] = useState(new Animated.Value(0));  // Estado de animación de desvanecimiento
  const [visible, setVisible] = useState(false);

  // Definir los estilos en base al tipo de mensaje
  const toastStyles = {
    normal: { backgroundColor: colors.card },
    success: { backgroundColor: colors.card },
    error: { backgroundColor: colors.card },
    info: { backgroundColor: colors.card },
    record: { backgroundColor: colors.card },  // Agregar estilo para 'record'
  };

  // Estilos según la posición
  const positionStyles = {
    top: { top: 20 },
    bottom: { bottom: 20 },
    center: { top: '50%', transform: [{ translateY: '-50%' }] },  // Centrado verticalmente
  };

  // Determinar el icono y color según el tipo
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <FontAwesome5 name="check-circle" size={24} color={colors.text.success} />;
      case 'error':
        return <FontAwesome5 name="times-circle" size={24} color={colors.text.danger} />;
      case 'info':
        return <FontAwesome5 name="info-circle" size={24} color={colors.text.info} />;
      case 'record':
        return <FontAwesome5 name="trophy" size={24} color={colors.text.warning} />;
      default:
        return <FontAwesome5 name="info-circle" size={24} color={colors.text.info} />;
    }
  };

  const handleShowToast = () => {
    setVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleHideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (onHide) onHide();  // Llamar a onHide si existe
    });
  };

  useEffect(() => {
    if (message) {
      handleShowToast();
      setTimeout(() => handleHideToast(), 3000);  // El toast desaparecerá después de 3 segundos
    }
  }, [message]);

  if (!visible) return null;  // Si el Toast no es visible, no lo renderiza

  return (
    <Animated.View 
      style={[
        styles.toastContainer, 
        { opacity: fadeAnim }, 
        toastStyles[type || 'info'], 
        positionStyles[position]  // Aplica el estilo de posición
      ]}
    >
      <View style={styles.toastContent}>
        {/* Aquí va el icono */}
        <View style={styles.iconContainer}>
          {getIcon(type)}
        </View>

        {/* Aquí va el texto */}
        <Text style={[styles.toastText, { color: colors.text.white, ...typography.bodyMedium }]}>
          {message}
        </Text>

        {/* Botón de cierre */}
        <TouchableOpacity onPress={handleHideToast}>
          <Text style={[styles.toastClose, { color: colors.text.white }]}>X</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// Estilos del componente ToastMessage
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
    marginRight: 10,  // Espacio entre el icono y el texto
  },
  toastText: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,  // Esto asegura que el texto ocupe el espacio disponible
  },
  toastClose: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ToastMessage;
