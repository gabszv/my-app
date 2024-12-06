import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const authenticateWithBiometrics = async () => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
            Alert.alert('Erro', 'O dispositivo não possui suporte a biometria.');
            return;
        }

        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (!supportedTypes.length) {
            Alert.alert('Erro', 'Nenhum método de autenticação biométrica disponível.');
            return;
        }

        const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Autenticação Biométrica',
            fallbackLabel: 'Usar senha',
        });

        if (result.success) {
            navigation.navigate('MainScreen');
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', 'Falha na autenticação biométrica.');
        }
    };

    const loginWithAPI = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://192.168.1.236:3000/login?username=${username}&password=${password}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Bem-vindo!', 'Login realizado com sucesso.');
                setTimeout(() => {
                    navigation.navigate('MainScreen');
                }, 1000);
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert('Erro', 'Usuário ou senha incorretos.');
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Erro', 'Falha ao conectar à API.');
        }
    };

    return (
        <View style={styles.loginContainer}>
            <Text style={styles.loginTitle}>LOGIN</Text>
            <View style={styles.inputSection}>
                <TextInput
                    style={styles.input}
                    placeholder="Usuário"
                    value={username}
                    onChangeText={setUsername}
                    placeholderTextColor="#bbb"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#bbb"
                />
            </View>
            {loading ? (
                <ActivityIndicator size="large" color="#fff" />
            ) : (
                <>
                    <TouchableOpacity style={styles.loginButton} onPress={loginWithAPI}>
                        <Text style={styles.loginButtonText}>Entrar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={authenticateWithBiometrics}>
                        <Text style={styles.linkText}>Entrar com Biometria</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

function MainScreen({ navigation }) {
    return (
        <View style={styles.mainContainer}>
            <Text style={styles.mainMessage}>Bem-vindo à página principal!</Text>
            <TouchableOpacity
                style={styles.exitButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.exitButtonText}>Sair</Text>
            </TouchableOpacity>
        </View>
    );
}

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="LoginScreen">
                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="MainScreen" component={MainScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loginContainer: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginTitle: {
        fontSize: 50,
        fontWeight: 'bold',
        color: '#ccc',
        marginBottom: 50,
    },
    inputSection: {
        width: '80%',
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#222',
        borderRadius: 10,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#444',
    },
    loginButton: {
        width: '80%',
        backgroundColor: '#444',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkText: {
        color: '#888',
        fontSize: 14,
        textDecorationLine: 'underline',
        marginTop: 15,
    },
    mainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    mainMessage: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 20,
    },
    exitButton: {
        padding: 15,
        backgroundColor: '#444',
        borderRadius: 8,
    },
    exitButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
