import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import { styleModal } from "../style/styleModal";
import { TextInput } from "react-native-paper";
import AxiosIntance from "../util/AxiosIntance";
import Toast from "react-native-toast-message";
import SpinnerOverlay from "../items/SpinnerOverlay";

const ItemListTypeWork = (props) => {
  const { item, index, totalItems, onUpdate, onDelete } = props;
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(item.name || "");

  const [isVisibleModalUpdate, setVisibleModalUpdate] = useState(false);

  const toggleModalUpdate = () => {
    setVisibleModalUpdate(!isVisibleModalUpdate);
  };

  // TODO: xóa loại công việc
  const handleDelete = async () => {
    setLoading(true);
    try {
      await AxiosIntance().delete(`/work/delete/${item._id}`);
      Toast.show({
        type: "success",
        text1: "Xóa thành công",
      });
      onDelete();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Xóa thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModalDelete = () => {
    Alert.alert("Xác nhận xóa", "Bạn chắc chắn muốn xóa loại công việc này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: () => handleDelete(),
      },
    ]);
  };

  const countdownIndex = totalItems - index;

  // TODO: xử lý cập nhật
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await AxiosIntance().put(`/work/update/${item._id}`, { name: name });
      Toast.show({
        type: "success",
        text1: "Cập nhật thành công",
      });
      toggleModalUpdate();
      onUpdate();
    } catch (error) {
      console.log("Lỗi cập nhật loại công việc", error);
      Toast.show({
        type: "error",
        text1: "Cập nhật thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={toggleModalDelete}
      onPress={toggleModalUpdate}
    >
      <SpinnerOverlay visible={loading} />

      <View style={{ flexDirection: "row" }}>
        <Text style={styles.text}>{countdownIndex}.</Text>
        <Text style={styles.text}> {item.name}</Text>
      </View>

      <Modal isVisible={isVisibleModalUpdate}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.titleModal}>Chỉnh sửa loại công việc</Text>
            <TextInput
              label="Loại công việc"
              mode="outlined"
              value={name}
              style={styles.textInput}
              onChangeText={(text) => setName(text)}
            />
          </View>
          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalUpdate}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUpdate} style={styleModal.button2}>
              <Text style={styleModal.textButton2}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
};

export default ItemListTypeWork;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: 5,
    margin: 10,
    borderColor: "#062446",
    elevation: 5,
    backgroundColor: "#e7eef6",
  },
  text: {
    fontWeight: "500",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalContent: {
    padding: 10,
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
  textInput: {
    marginTop: 10,
  },
});
