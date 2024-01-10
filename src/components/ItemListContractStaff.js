import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { format, parseISO } from "date-fns";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { Table, Row, Rows } from "react-native-table-component";
import moment from "moment";

const ItemListContractStaff = (props) => {
  const { item } = props;

  const [isVisibleModalDetails, setVisibleModalDetails] = useState(false);

  const toggleModal = () => {
    setVisibleModalDetails(!isVisibleModalDetails);
  };

  const dateTimeString = item ? item.signingDate : null;
  const dateTime = dateTimeString ? parseISO(dateTimeString) : null;
  const formattedDateTime = dateTime
    ? format(dateTime, "dd/MM/yyyy HH:mm:ss")
    : null;

  // Format lại giờ hẹn
  const formattedWorkDate = moment(item.workDate)
    .utcOffset(0)
    .format("HH:mm DD/MM/YYYY");

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.label}>Khách hàng</Text>
        <Text style={styles.infoText}>{item.clientId.name}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Ngày hẹn</Text>
        <Text style={styles.infoText}>{formattedWorkDate}</Text>
      </View>
      <Text
        style={[
          styles.status,
          {
            backgroundColor:
              item.status === "Chưa thanh toán" ? "#db9200" : "#4CAF50",
          },
        ]}
      >{item.status}</Text>

      <View
        style={{
          height: 1,
          backgroundColor: "#dfdfdf",
          marginTop: 5,
          marginBottom: 5,
        }}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <TouchableOpacity style={styles.editButton} onPress={toggleModal}>
          <Text style={styles.editButtonText}>Chi tiết hợp đồng</Text>
          <MaterialIcons
            style={{ marginTop: 1 }}
            name="navigate-next"
            size={18}
            color={"#4285f4"}
          />
        </TouchableOpacity>
      </View>

      {/* Modal thông tin chi tiết hợp đồng */}
      <Modal isVisible={isVisibleModalDetails} style={styles.modalContainer}>
        <ScrollView style={styles.modalContent}>
          <View style={styles.contractHeader}>
            <Text style={styles.titleModal}>HỢP ĐỒNG</Text>
            <Text style={{ textAlign: "center", marginBottom: 10 }}>
              Thông tin chi tiết hợp đồng
            </Text>
          </View>

          <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
            <Row
              data={["Ngày ký"]}
              style={styles.head}
              textStyle={styles.headText}
            />
            <Row
              data={[formattedDateTime]}
              textStyle={{ textAlign: "center", ...styles.text }}
            />
          </Table>

          {/* Phần thông tin khách hàng */}
          <View style={styles.section}>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
              <Row
                data={["Thông tin khách hàng"]}
                style={styles.head}
                textStyle={styles.headText}
              />
              <Rows
                data={[
                  [
                    <Text style={styles.boldText}>Khách hàng</Text>,
                    item.clientId.name,
                  ],
                  [
                    <Text style={styles.boldText}>Số điện thoại</Text>,
                    item.clientId.phone,
                  ],
                  [
                    <Text style={styles.boldText}>Số điện thoại phụ</Text>,
                    item.clientId.phone2 || "Chưa cập nhật",
                  ],
                  [
                    <Text style={styles.boldText}>Địa chỉ</Text>,
                    item.clientId.address,
                  ],
                  // Thêm thông tin khác nếu cần
                ]}
                textStyle={{ ...styles.text }}
              />
            </Table>
          </View>

          {/* Phần thông tin dịch vụ */}
          <View style={styles.section}>
            <Table
              borderStyle={{
                borderWidth: 1,
                borderColor: "#C1C0B9",
                marginTop: 15,
              }}
            >
              <Row
                data={["Thông tin dịch vụ"]}
                style={styles.head}
                textStyle={{ ...styles.headText }}
              />
              {/* Lặp qua danh sách dịch vụ và thêm vào bảng */}
              {item.services.map((service, index) => (
                <Rows
                  key={index}
                  data={[[service.serviceId.name]]}
                  textStyle={styles.text}
                />
              ))}
            </Table>
          </View>

          <View style={styles.section}>
            <ScrollView horizontal>
              <Table
                borderStyle={{
                  borderWidth: 1,
                  borderColor: "#C1C0B9",
                  marginTop: 15,
                }}
              >
                <Row
                  data={["Thông tin trang phục"]}
                  style={styles.head}
                  textStyle={styles.headText}
                />
                <Row
                  data={["Trang phục", "Ngày mượn", "Ngày trả", "Mô tả"]}
                  textStyle={{ width: 120, ...styles.headerText }}
                />

                {/* Lặp qua danh sách trang phục và thêm vào bảng */}
                {item.weddingOutfit.map((outfit, index) => (
                  <Row
                    key={index}
                    data={[
                      outfit.weddingOutfitId.name,
                      moment(outfit.rentalDate).format("DD/MM/yyyy"), // Ngày mượn (cần cập nhật dữ liệu thực tế)
                      moment(outfit.returnDate).format("DD/MM/yyyy"), // Ngày trả (cần cập nhật dữ liệu thực tế)
                      outfit.description || "Không",
                    ]}
                    textStyle={{
                      width: 120,
                      textAlign: "center",
                      ...styles.text,
                    }}
                  />
                ))}
              </Table>
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
              <Row
                data={["Thông tin thanh toán và lịch hẹn"]}
                style={styles.head}
                textStyle={styles.headText}
              />
              <Rows
                data={[
                  [
                    <Text style={styles.boldText}>Ngày hẹn chụp ảnh</Text>,
                    moment(item.workDate).format("DD/MM/yyyy"),
                  ],
                  [
                    <Text style={styles.boldText}>Ngày trả ảnh</Text>,
                    moment(item.deliveryDate).format("DD/MM/yyyy"),
                  ],
                  [
                    <Text style={styles.boldText}>Địa điểm làm việc</Text>,
                    item.location,
                  ],
                  [
                    <Text style={styles.boldText}>Ghi chú</Text>,
                    item.note || "Không",
                  ],
                ]}
                textStyle={styles.text}
              />
            </Table>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ItemListContractStaff;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 2,
    margin: 6,
  },
  header: {
    marginBottom: 10,
    alignItems: "center",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  info: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    color: "#878787",
    fontWeight: "bold",
  },
  infoText: {
    color: "#333",
    fontWeight: "500",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  editButtonText: {
    color: "#4285f4",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 12,
  },
  editIcon: {
    marginTop: 1,
  },
  status: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 10,
    overflow: "hidden",
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    width: "100%",
    alignSelf: "center",
  },
  head: {
    height: 40,
    backgroundColor: "#e7eef6",
  },
  headText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    margin: 6,
  },
  text: {
    fontSize: 14,
    margin: 6,
  },
  closeButton: {
    backgroundColor: "#0e55a7",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  section: {
    marginTop: 20,
  },
  boldText: {
    fontWeight: "bold",
    fontSize: 14,
    margin: 6,
  },
  titleModal: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#0e55a7",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    borderWidth: 1,
    justifyContent: "center",
  },
  exportButtonText: {
    fontWeight: "bold",
    marginLeft: 5,
  },
  modalContainer2: {
    backgroundColor: "white",
    borderRadius: 6,
  },
});
