import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import moment from "moment";

const ItemListWorkByDate = (props) => {
  const { item } = props;

  // Format lại giờ từ UTC
  const formattedDate = moment(item.workDate)
    .utcOffset(0)
    .format("HH:mm DD-MM-YYYY");

  const statusColor = item.status === "Chưa hoàn thành" ? "red" : "green";

  return (
    <View style={styles.container}>
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
    </View>
  );
};

export default ItemListWorkByDate;

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
});
