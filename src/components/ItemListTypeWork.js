import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import Modal from "react-native-modal";
import { styleModal } from "../style/styleModal";
import { TextInput } from "react-native-paper";

const ItemListTypeWork = (props) => {
  const { item, index, totalItems } = props;

  const [isVisibleModalUpdate, setVisibleModalUpdate] = useState(false);

  const toggleModalUpdate = () => {
    setVisibleModalUpdate(!isVisibleModalUpdate);
  };

  const toggleModalDelete = () => {
    Alert.alert("Xác nhận xóa", "Bạn chắc chắn muốn xóa loại công việc này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: () => {},
      },
    ]);
  };

  const countdownIndex = totalItems - index;

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={toggleModalDelete}
      onPress={toggleModalUpdate}
    >
      <View style={{flexDirection: 'row'}}>
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
              value={item.name}
              style={styles.textInput}
            />
          </View>
          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalUpdate}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={updateService}
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
