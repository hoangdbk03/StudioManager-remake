import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect } from "react";
import AxiosIntance from "../util/AxiosIntance";
import moment from "moment";
import Modal from "react-native-modal";
import { useState } from "react";
import { styleModal } from "../style/styleModal";
import { TextInput } from "react-native-paper";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
import SpinnerOverlay from "../items/SpinnerOverlay";

const ItemListWork = (props) => {
  const { item, onDelete, onUpdate } = props;
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(item.address || "");
  const [note, setNote] = useState(item.note || "");
  const [isVisibleModalUpdates, setVisibleModalUpdates] = useState(false);

  const toggleModalUpdates = () => {
    setVisibleModalUpdates(!isVisibleModalUpdates);
    setAddress(item.address);
    setNote(item.note);
  };

  // TODO: xử lý xóa công việc
  const deleteWork = async () => {
    setLoading(true);
    try {
      await AxiosIntance().delete(`/work/delete-work/${item._id}`);
      Toast.show({
        type: "success",
        text1: "Xóa thành công",
      });
      setLoading(false);
    } catch (error) {
      console.log("Xóa công việc thất bại", error);
      Toast.show({
        type: "error",
        text1: "Xóa thất bại",
      });
    }
  };
  // xác nhận xóa
  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn chắc chắn muốn xóa công việc ${item.workType_ID.name} của nhân viên ${item.user_ID.name}?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          onPress: () => {
            deleteWork(), onDelete();
          },
        },
      ]
    );
  };

  // TODO: xử lý cập nhật công việc
  const handleUpdateWork = async () => {
    setLoading(true);
    try {
      const data = {
        address: address,
        note: note,
      };
      if (address !== item.address || note !== item.note) {
        if (!address) {
          Alert.alert("Thông báo", "Vui lòng nhập địa chỉ làm việc!");
          return;
        }
        await AxiosIntance().put(`/work/update-work/${item._id}`, data);
        Toast.show({
          type: "success",
          text1: "Cập nhật công việc thành công",
        });
        
        setLoading(false);
        toggleModalUpdates();
        onUpdate();
      } else {
        Alert.alert("Thông báo", "Không có dữ liệu cần thay đổi");
      }
    } catch (error) {
      console.log("Cập nhật công việc thất bại", error);
      Toast.show({
        type: "error",
        text1: "Xóa thất bại",
      });
    }
  };

  // Format lại giờ từ UTC
  const formattedDate = moment(item.workDate)
    .utcOffset(0)
    .format("HH:mm DD-MM-YYYY");

  const statusColor = item.status === "Chưa hoàn thành" ? "red" : "green";

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.container}
      onPress={toggleModalUpdates}
      onLongPress={handleDelete}
    >
      <SpinnerOverlay visible={loading} />

      <View style={styles.cardContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.workType_ID.name}</Text>
          <Image style={styles.avatar} source={{ uri: item.user_ID.avatar }} />
        </View>
        <Text style={styles.subtitle}>
          Nhân viên phụ trách: {item.user_ID.name}
        </Text>
        <Text style={styles.subtitle}>Thời gian làm việc: {formattedDate}</Text>
        <Text style={styles.subtitle}>Địa điểm làm việc: {item.address}</Text>
        <Text style={styles.subtitle}>Ghi chú: {item.note || "Không"}</Text>
        <Text style={[styles.status, { backgroundColor: statusColor }]}>
          {item.status}
        </Text>
      </View>

      {/* Modal cập nhật */}
      <Modal isVisible={isVisibleModalUpdates}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.titleModal}>Chỉnh sửa công việc</Text>
            <TextInput
              label="Công việc"
              mode="outlined"
              value={item.workType_ID.name}
              style={styles.textInput}
              contentStyle={{ color: "gray" }}
              editable={false}
            />
            <TextInput
              label="Nhân viên phụ trách"
              mode="outlined"
              value={item.user_ID.name}
              style={styles.textInput}
              contentStyle={{ color: "gray" }}
              editable={false}
            />
            <TextInput
              label="Thời gian làm việc"
              mode="outlined"
              value={formattedDate}
              style={styles.textInput}
              editable={false}
              contentStyle={{ color: "gray" }}
            />

            <TextInput
              label="Địa điểm làm việc"
              mode="outlined"
              value={address}
              style={styles.textInput}
              onChangeText={(text) => setAddress(text)}
            />
            <TextInput
              label="Ghi chú"
              mode="outlined"
              value={note}
              style={styles.textInput}
              onChangeText={(text) => setNote(text)}
            />
          </View>
          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalUpdates}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleUpdateWork}
              style={styleModal.button2}
            >
              <Text style={styleModal.textButton2}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default ItemListWork;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  cardContainer: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 2,
    margin: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    paddingVertical: 8,
    borderRadius: 5,
    textAlign: "center",
    marginTop: 10,
    overflow: "hidden",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalContent: {
    padding: 10,
  },
  textInput: {
    marginTop: 10,
  },
  titleModal: {
    padding: 18,
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    backgroundColor: "#0E55A7",
    borderRadius: 10,
    textAlign: "center",
  },
});
