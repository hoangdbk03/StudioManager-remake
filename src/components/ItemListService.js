import {
  Image,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { AppConText } from "../util/AppContext";
import Toast from "react-native-toast-message";
import AxiosIntance from "../util/AxiosIntance";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";

const ItemListService = (props) => {
  const { item, onEdit, onDelete, onModal } = props;
  
  const { inforUser } = useContext(AppConText);
  const navigation = useNavigation();

  const formatPrice = (price) => {
    const formattedPrice = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
    return formattedPrice.replace(/\s₫/, "");
  };

  const handleEditService = () => {
    if (onEdit) {
      onEdit(item);
    }
  };
  const handleDeleteService = () => {
    if (onDelete) {
      onDelete(item);
    }
  };


  return (
    <View style={styles.container}>
      <View>
        <View style={styles.frameImg}>
          <Image style={styles.image} source={{ uri: item.image }} />
        </View>
      </View>
      <View style={styles.infor}>
        <Text numberOfLines={2} style={styles.textName}>
          {item.name}
        </Text>
      </View>
      {inforUser.role ==! "Nhân viên" &&(
        <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.textPrice}>{formatPrice(item.price)}₫</Text>
      </View>
      )}

      <View
        style={{ height: 0.8, backgroundColor: "#b0b0b0", borderRadius: 20 }}
      />

      {/* Xem chi tiết */}
      <View>
        <TouchableOpacity onPress={() => onModal(item)}>
          <View style={styles.detailUser}>
            <Text style={{ color: "#90b1d7", marginStart: 5, fontSize: 13 }}>
              Xem chi tiết...
            </Text>
            <MaterialIcons
              name="navigate-next"
              size={20}
              color={"#90b1d7"}
              style={{ marginEnd: 10 }}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Các nút thêm sửa xóa */}
      {inforUser.role === "Nhân viên" ? null : (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={styles.buttonEdit}
            onPress={handleEditService}
          >
            <Text style={styles.textButton}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonDel}
            onPress={handleDeleteService}
          >
            <Text style={styles.textButtonDel}>Xóa</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ItemListService;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e7eef6",
    padding: 10,
    margin: 10,
    borderRadius: 16,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  frameImg: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  infor: {
    height: "auto",
    alignItems: "center",
  },
  buttonAdd: {
    backgroundColor: "white",
    borderColor: "#0E55A7",
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
  },
  textButton: {
    color: "#0E55A7",
    fontWeight: "500",
  },
  textButtonDel: {
    color: "#fc6261",
    fontWeight: "500",
  },
  textName: {
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 5,
    height: 40,
    color: "#333333",
  },
  textPrice: {
    color: "#545454",
    bottom: 1,
  },
  buttonEdit: {
    backgroundColor: "white",
    borderColor: "#0E55A7",
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    width: 70,
  },
  buttonDel: {
    backgroundColor: "white",
    borderColor: "#fc6261",
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 10,
    width: 70,
  },
  detailUser: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginStart: 10,
    alignItems: "center",
    marginTop: 5,
  },
});
