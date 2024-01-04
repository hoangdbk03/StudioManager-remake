import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useState } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SplashScreen from "../components/SplashScreen";
import Login from "../components/Login";
import Home from "../components/Home";
import Contract from "../components/Contract";
import Profile from "../components/Profile";
import { AppConText } from "./AppContext";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Octicons from "react-native-vector-icons/Octicons";
import ManagerSkin from "../components/ManagerSkin";
import Register from "../components/Register";
import ManagerStaff from "../components/ManagerStaff";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import DetailStaff from "../components/DetailStaff";
import ManagerService from "../components/ManagerService";
import ManagerClient from "../components/ManagerClient";
import DetailUser from "../components/DetailUser";
import Statistical from "../components/Statistical";
import ForgotPassword from "../components/ForgotPassword";
import Salary from "../components/Salary";
import ManagerWork from "../components/ManagerWork";
import TypeWork from "../components/TypeWork";
import ContractStaff from "../components/ContractStaff";

// TODO: splashScreen, login (Stack)
const Stack = createStackNavigator();
const Users = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPassword}
        options={{
          headerShown: true,
          title: "Gửi lại mật khẩu",
          headerBackTitle: "Quay lại",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
};

// TODO: trang chủ, lịch, lịch sử, profile (Tab)
const Tab = createBottomTabNavigator();
const Main = () => {
  const { inforUser } = useContext(AppConText);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIconStyle: {
          ...(Platform.OS === "ios" && { top: 12 }),
        },
        headerShown: false,
        tabBarStyle: {
          display: hideTabBar(route),
          ...styles.shadow,
          ...(Platform.OS === "ios" && { bottom: 0 }),
        },
        tabBarLabelStyle: {
          bottom: 10,
          fontSize: 12,
          ...(Platform.OS === "ios" && { top: 18 }),
        },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={PageHome}
        options={({ route }) => ({
          title: "Trang chủ",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name == "Home") {
              iconName = focused ? "home" : "home";
            }
            return <Octicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#0E55A7",
        })}
      ></Tab.Screen>

      <Tab.Screen
        name="ManagerWork"
        component={ManagerWork}
        options={({ route }) => ({
          title: "Công việc",
          tabBarIcon: ({ focused, color }) => {
            let iconImage = focused
              ? require("../icons/calendar.png")
              : require("../icons/calendar.png");
            return (
              <Image
                source={iconImage}
                style={{ width: 25, height: 30, tintColor: color }}
              />
            );
          },
          tabBarActiveTintColor: "#0E55A7",
        })}
      ></Tab.Screen>
      {!inforUser || inforUser.role !== "Nhân viên" ? (
        <Tab.Screen
          name="Contract"
          component={Contract}
          options={({ route }) => ({
            title: "Hợp đồng",
            tabBarIcon: ({ focused, color }) => {
              let iconImage = focused
                ? require("../icons/contract.png")
                : require("../icons/contract.png");
              return (
                <Image
                  source={iconImage}
                  style={{ width: 22, height: 22, tintColor: color }}
                />
              );
            },
            tabBarActiveTintColor: "#0E55A7",
          })}
        ></Tab.Screen>
      ) : (
        <Tab.Screen
          name="ContractStaff"
          component={ContractStaff}
          options={({ route }) => ({
            title: "Hợp đồng",
            tabBarIcon: ({ focused, color }) => {
              let iconImage = focused
                ? require("../icons/contract.png")
                : require("../icons/contract.png");
              return (
                <Image
                  source={iconImage}
                  style={{ width: 22, height: 22, tintColor: color }}
                />
              );
            },
            tabBarActiveTintColor: "#0E55A7",
          })}
        ></Tab.Screen>
      )}
      <Tab.Screen
        name="PageProfile"
        component={PageProfile}
        options={({ route }) => ({
          // tabBarStyle:{display: hideTabBar(route)},
          title: "Cá nhân",
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name == "PageProfile") {
              iconName = focused ? "user-circle" : "user-circle";
            }
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#0E55A7",
        })}
      ></Tab.Screen>
    </Tab.Navigator>
  );
};

// TODO: trang home
const PageHome = () => {
  return (
    <Stack.Navigator initialRouteName="PageHome">
      <Stack.Screen
        name="PageHome"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManagerStaff"
        component={ManagerStaff}
        options={{
          headerTitle: "Quản lý nhân viên",
          headerBackTitle: "Quay lại",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="DetailStaff"
        component={DetailStaff}
        options={{
          headerTitle: "Thông tin nhân viên",
          headerStyle: { backgroundColor: "#062446", elevation: 0 },
          headerTitleAlign: "center",
          headerTintColor: "white",
          headerBackTitle: "Quay lại",
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen
        name="ManagerService"
        component={ManagerService}
        options={{
          headerTitle: "Dịch vụ",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ManagerSkin"
        component={ManagerSkin}
        options={{
          headerTitle: "Quản lý trang phục",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        options={{
          headerTitle: "Đăng ký người dùng",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Statistical"
        component={Statistical}
        options={{
          headerTitle: "Thống kê",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Salary"
        component={Salary}
        options={{
          headerTitle: "Lương thưởng nhân viên",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="TypeWork"
        component={TypeWork}
        options={{
          headerTitle: "Quản lý loại công việc",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ManagerClient"
        component={ManagerClient}
        options={{
          headerTitle: "Quản lý khách hàng",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
};

// TODO: Trang cá nhân
const PageProfile = () => {
  return (
    <Stack.Navigator initialRouteName="Profile">
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetailUser"
        component={DetailUser}
        options={{
          headerTitle: "Thông tin của bạn",
          headerBackTitle: "Quay lại",
          headerTitleAlign: "center",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
};

// * xử lý ẩn bottom bar khi sử dụng stack
const hideTabBar = (route) => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Home";

  const screensToHideTabBar = [
    "ManagerSkin",
    "Register",
    "ManagerStaff",
    "DetailStaff",
    "ManagerService",
    "DetailUser",
    "Statistical",
    "Salary",
    "TypeWork",
    "ManagerClient"
  ];

  if (screensToHideTabBar.includes(routeName)) {
    return "none";
  }
  return "flex";
};

// TODO: Main
const AppNavigator = () => {
  const { isLogin } = useContext(AppConText);
  return <>{isLogin == false ? <Users /> : <Main />}</>;
};

export default AppNavigator;

const styles = StyleSheet.create({
  shadow: {
    position: "absolute",
    borderWidth: 4,
    borderColor: "#0E55A7",
    bottom: 15,
    left: 10,
    right: 10,
    borderRadius: 15,
    height: Platform.OS === "ios" ? 73 : 70,
  },
  tabIcon: {
    justifyContent: "center",
    alignItems: "center",
    top: 10,
  },
});
