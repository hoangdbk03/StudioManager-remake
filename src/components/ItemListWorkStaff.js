import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import moment from "moment";
import { useState } from "react";
import { Dropdown } from "react-native-element-dropdown";

const ItemListWorkStaff = (props) => {
  const { item } = props;

  const [selectedStatus, setSelectedStatus] = useState("");

  // Format lại giờ từ UTC
  const formattedDate = moment(item.workDate)
    .utcOffset(0)
    .format("HH:mm DD-MM-YYYY");

  const statusColor = item.status === "Chưa hoàn thành" ? "red" : "green";

  return (
    <TouchableOpacity activeOpacity={1} style={styles.container}>
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
          style={{ backgroundColor: statusColor, borderRadius: 5, marginTop: 10 }}
          placeholderStyle={{
            textAlign: "center",
            fontWeight: "500",
            color: "white",
          }}
          onChange={(newStatus) => {}}
          iconColor="white"
          containerStyle={{borderRadius: 5, borderWidth: 1, borderColor: '#90b1d7'}}
          itemTextStyle={{fontWeight: '500'}}
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
