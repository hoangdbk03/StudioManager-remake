import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect } from "react";
import moment from "moment";
import { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import AxiosIntance from "../util/AxiosIntance";
import Toast from "react-native-toast-message";
import SpinnerOverlay from "../items/SpinnerOverlay";

const ItemListWorkStaff = (props) => {
  const { item, onUpdate } = props;

  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Format lại giờ từ UTC
  const formattedDate = moment(item.workDate)
    .utcOffset(0)
    .format("HH:mm DD-MM-YYYY");

  const statusColor = item.status === "Chưa hoàn thành" ? "red" : "green";

  const handleUpdateStatus = async (status) => {
    // Kiểm tra nếu là trạng thái "Đã hoàn thành"
    if (item.status === "Đã hoàn thành") {
      // Hiển thị Alert để xác nhận từ người dùng
      Alert.alert(
        "Xác nhận",
        "Công việc này của bạn đã hoàn thành. Bạn chắc chắn muốn quay lại trạng thái chưa hoàn thành không?",
        [
          {
            text: "Hủy",
            style: "cancel",
            onPress: () => {
              setLoading(false);
            },
          },
          {
            text: "Đồng ý",
            onPress: async () => {
              // Thực hiện xử lý api khi người dùng bấm OK
              await handleApiUpdateStatus(status);
            },
          },
        ]
      );
    } else {
      // Trường hợp không phải là "Đã hoàn thành" hoặc người dùng không chọn lại "Chưa hoàn thành" từ "Đã hoàn thành"
      await handleApiUpdateStatus(status);
    }
  };

  // Hàm xử lý api
  const handleApiUpdateStatus = async (status) => {
    setLoading(true);
    try {
      const data = {
        status: status,
      };
      await AxiosIntance().put(`/work/update-work/${item._id}`, data);
      Toast.show({
        type: "success",
        text1: "Cập nhật trạng thái thành công",
      });
      onUpdate();
    } catch (error) {
      console.log("Lỗi cập nhật trạng thái công việc", error);
      Toast.show({
        type: "error",
        text1: "Tạo hợp đồng thất bại",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container}>
      <SpinnerOverlay visible={loading} />
      <View style={styles.cardContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>{item.workType_ID.name}</Text>
        </View>
        <Text style={styles.subtitle}>Thời gian làm việc: {formattedDate}</Text>
        <Text style={styles.subtitle}>Địa điểm làm việc: {item.address}</Text>
        <Text style={styles.subtitle}>Ghi chú: {item.note || "Không"}</Text>
        <Dropdown
          data={[
            { label: "Chưa hoàn thành", value: "1" },
            { label: "Đã hoàn thành", value: "2" },
          ]}
          placeholder={item.status}
          labelField="label"
          valueField="value"
          style={{
            backgroundColor: statusColor,
            borderRadius: 5,
            marginTop: 10,
          }}
          placeholderStyle={{
            textAlign: "center",
            fontWeight: "500",
            color: "white",
          }}
          onChange={(item) => {
            setSelectedStatus(item.label), handleUpdateStatus(item.label);
          }}
          value={selectedStatus}
          iconColor="white"
          containerStyle={{
            borderRadius: 5,
            borderWidth: 1,
            borderColor: "#90b1d7",
          }}
          itemTextStyle={{ fontWeight: "500" }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ItemListWorkStaff;

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
