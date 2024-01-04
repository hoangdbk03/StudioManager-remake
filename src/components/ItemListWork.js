import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import AxiosIntance from "../util/AxiosIntance";
import moment from "moment";
import Modal from "react-native-modal";
import { useState } from "react";
import { styleModal } from "../style/styleModal";
import { TextInput } from "react-native-paper";
import { Alert } from "react-native";

const ItemListWork = (props) => {
  const { item } = props;

  const [isVisibleModalUpdates, setVisibleModalUpdates] = useState(false);

  const toggleModalUpdates = () => {
    setVisibleModalUpdates(!isVisibleModalUpdates);
  };

  const handleDelete = () =>{
    Alert.alert("Xác nhận xóa", `Bạn chắc chắn muốn xóa công việc ${item.workType_ID.name}?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        onPress: () => {},
      },
    ]);
  }

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
        <Text style={styles.subtitle}>Ghi chú: {item.note}</Text>
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
              contentStyle={{color: "gray"}}
              editable={false}
            />
            <TextInput
              label="Nhân viên phụ trách"
              mode="outlined"
              value={item.user_ID.name}
              style={styles.textInput}
              contentStyle={{color: "gray"}}
              editable={false}
            />
            <TextInput
              label="Thời gian làm việc"
              mode="outlined"
              value={formattedDate}
              style={styles.textInput}
            />
            <TextInput
              label="Địa điểm làm việc"
              mode="outlined"
              value={item.address}
              style={styles.textInput}
            />
            <TextInput
              label="Ghi chú"
              mode="outlined"
              value={item.note}
              style={styles.textInput}
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
