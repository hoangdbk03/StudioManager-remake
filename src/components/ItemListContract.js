import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { format, parseISO } from "date-fns";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from "react-native-vector-icons/AntDesign";
import Modal from "react-native-modal";
import MapView, { Marker } from "react-native-maps";
import { Table, Row, Rows } from "react-native-table-component";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { TextInput } from "react-native-paper";
import { AppConText } from "../util/AppContext";
import { useEffect } from "react";
import { styleModal } from "../style/styleModal";
import moment from "moment";
import AxiosIntance from "../util/AxiosIntance";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native";
import SpinnerOverlay from "../items/SpinnerOverlay";

const ItemListContract = (props) => {
  const { item } = props;
  const { inforUser } = useContext(AppConText);
  const [loading, setLoading] = useState(false);

  const [isVisibleModalDetails, setVisibleModalDetails] = useState(false);
  const [isVisibleModalUpdates, setVisibleModalUpdates] = useState(false);

  // * Phần cập nhật
  const [editedAdditionalCosts, setEditedAdditionalCosts] = useState([
    {
      userId: inforUser._id,
      description: "",
      price: "",
    },
  ]);
  const [editedPrepayment, setEditedPrepayment] = useState("");
  const [updatedTotalPrice, setUpdatedTotalPrice] = useState("");

  const handleDescriptionChange = (text, index) => {
    const newAdditionalCosts = [...editedAdditionalCosts];
    newAdditionalCosts[index].description = text;
    setEditedAdditionalCosts(newAdditionalCosts);
  };

  const handlePriceChange = (text, index) => {
    const newAdditionalCosts = [...editedAdditionalCosts];
    newAdditionalCosts[index].price = text.replace(/[^\d]/g, "");
    setEditedAdditionalCosts(newAdditionalCosts);

    // Tính toán và cập nhật giá trị tổng tiền sau khi thay đổi giá trị chi phí phát sinh
    const total = item.priceTotal + calculateAdditionalCostsTotal();
    setUpdatedTotalPrice(total);
  };

  const removeAdditionalCost = (index) => {
    const newAdditionalCosts = [...editedAdditionalCosts];
    newAdditionalCosts.splice(index, 1);
    setEditedAdditionalCosts(newAdditionalCosts);
  };

  const addAdditionalCost = () => {
    setEditedAdditionalCosts([
      ...editedAdditionalCosts,
      {
        description: "",
        price: "",
      },
    ]);
  };

  // TODO: xử lý cập nhật hợp đồng
  const handleUpdateContract = async () => {
    try {
      setLoading(true);
      const additionalCostsTotal = calculateAdditionalCostsTotal();

      const data = {
        additionalCosts: editedAdditionalCosts,
        prepayment: editedPrepayment,
        priceTotal:
          additionalCostsTotal > 0
            ? item.priceTotal + additionalCostsTotal
            : item.priceTotal,
        // Thêm các trường dữ liệu khác nếu có
      };

      await AxiosIntance().put(`/contract/update/${item._id}`, data);
      Toast.show({
        type: "success",
        text1: "Cập nhật thành công",
      });
      setLoading(false);
      toggleModalUpdate();
      props.onContractUpdated();
    } catch (error) {
      setLoading(false);
      console.log("Lỗi cập nhật hợp đồng: ", error);
      Toast.show({
        type: "error",
        text1: "Cập nhật thất bại",
      });
    }
  };

  const cancelContract = async () => {
    try {
      setLoading(true);
      const cancel = {
        status: "Đã hủy",
      };
      await AxiosIntance().put(`/contract/update/${item._id}`, cancel);
      Toast.show({
        type: "success",
        text1: "Hủy hợp đồng thành công",
      });
      setLoading(false);
      props.onContractUpdated();
    } catch (error) {
      setLoading(false);
      console.log("Lỗi hủy hợp đồng: ", error);
      Toast.show({
        type: "error",
        text1: "Hủy thất bại",
      });
    }
  };

  useEffect(() => {
    if (isVisibleModalDetails) {
      setEditedPrepayment("");
      setEditedAdditionalCosts([
        {
          description: "",
          price: "",
        },
      ]);
      setUpdatedTotalPrice("");
    }
  }, [isVisibleModalDetails]);

  const toggleModal = () => {
    setVisibleModalDetails(!isVisibleModalDetails);
  };

  const toggleModalUpdate = () => {
    if (item.status === "Đã thanh toán" || item.status === "Đã hủy") {
      // Hiển thị cảnh báo khi trạng thái là "Đã thanh toán" hoặc "Đã hủy"
      Alert.alert(
        "Thông báo",
        "Không thể chỉnh sửa hợp đồng đã thanh toán hoặc đã hủy.",
        [{ text: "OK", onPress: () => {} }]
      );
    } else {
      setVisibleModalUpdates(!isVisibleModalUpdates);
      removeAdditionalCost();
      setEditedPrepayment("");
    }
  };

  const dateTimeString = item ? item.signingDate : null;
  const dateTime = dateTimeString ? parseISO(dateTimeString) : null;
  const formattedDateTime = dateTime
    ? format(dateTime, "dd/MM/yyyy HH:mm:ss")
    : null;

  const formatCurrency = (amount) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formatter.format(amount);
  };

  // xuất PDF cho khách hàng
  const exportPDF = async () => {
    try {
      const additionalCostsHTML =
        item.additionalCosts.length > 0
          ? `
    <tr>
      <td style="font-weight: bold; padding: 8px;">Chi phí phát sinh</td>
      <td style="padding: 8px;">
        ${item.additionalCosts
          .map(
            (cost) => `
            ${cost.description}: ${formatCurrency(cost.price)}
          `
          )
          .join("<br />")}
      </td>
    </tr>
  `
          : "";

      const htmlContent = `
      <div style="font-family: Arial, sans-serif;">
        <h1 style="text-align: center;">Hợp đồng</h1>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 30%; font-weight: bold;">Người ký:</td>
            <td>${item.userId.name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Ngày ký:</td>
            <td>${formattedDateTime}</td>
          </tr>
        </table>

        <h2>Thông tin khách hàng</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 30%; font-weight: bold;">Khách hàng:</td>
            <td>${item.clientId.name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Số điện thoại:</td>
            <td>${item.clientId.phone}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Số điện thoại phụ:</td>
            <td>${item.clientId.phone2 || "Chưa cập nhật"}</td>
          </tr>
          <tr>
            <td style="font-weight: bold;">Địa chỉ:</td>
            <td>${item.clientId.address}</td>
          </tr>
        </table>

        <h2>Thông tin dịch vụ</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 30%; font-weight: bold;">Dịch vụ</td>
            <td style="font-weight: bold;">Giá</td>
          </tr>
          ${item.services
            .map(
              (service) => `
              <tr>
                <td>${service.serviceId.name}</td>
                <td>${formatCurrency(service.serviceId.price)}</td>
              </tr>
            `
            )
            .join("")}
        </table>

        <h2>Thông tin trang phục</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="width: 30%; font-weight: bold;">Trang phục</td>
            <td style="font-weight: bold;">Giá</td>
            <td style="font-weight: bold;">Ngày mượn</td>
            <td style="font-weight: bold;">Ngày trả</td>
            <td style="font-weight: bold;">Mô tả</td>
          </tr>
          ${item.weddingOutfit
            .map(
              (outfit) => `
              <tr>
                <td>${outfit.weddingOutfitId.name}</td>
                <td>${formatCurrency(outfit.weddingOutfitId.price)}</td>
                <td>01/01/2024</td> <!-- Cần cập nhật dữ liệu thực tế -->
                <td>01/01/2024</td> <!-- Cần cập nhật dữ liệu thực tế -->
                <td>${outfit.description || "Không"}</td>
              </tr>
            `
            )
            .join("")}
        </table>

        <h2>Thông tin thanh toán và lịch hẹn</h2>
  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="width: 30%; font-weight: bold; padding: 8px;">Giảm giá</td>
      <td style="padding: 8px;">${
        item.discount ? item.discount + "%" : "Không"
      }</td>
    </tr>
    ${additionalCostsHTML}
    <tr>
      <td style="font-weight: bold; padding: 8px;">Tổng tiền (Đã bao gồm chi phí phát sinh)</td>
      <td style="padding: 8px;">${formatCurrency(item.priceTotal)}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 8px;">Đã thanh toán</td>
      <td style="padding: 8px;">${formatCurrency(item.prepayment)}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 8px;">Ngày hẹn</td>
      <td style="padding: 8px;">06:30 11/01/2024</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 8px;">Ngày trả ảnh</td>
      <td style="padding: 8px;">15/01/2024</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 8px;">Địa điểm làm việc</td>
      <td style="padding: 8px;">${item.location}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 8px;">Ghi chú</td>
      <td style="padding: 8px;">${item.note || "Không"}</td>
    </tr>
    <tr>
      <td style="font-weight: bold; padding: 8px;">Trạng thái</td>
      <td style="padding: 8px;">${item.status}</td>
    </tr>
  </table>

      </div>
    `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: "Chia sẻ file PDF",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const handleCancelContract = () => {
    if (item.status === "Chưa thanh toán") {
      Alert.alert("Thông báo", `Bạn chắc chắn muốn hủy hợp đồng này?`, [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Hủy hợp đồng",
          onPress: () => cancelContract(),
        },
      ]);
    }
  };

  // chi phí phát sinh
  const calculateAdditionalCostsTotal = () => {
    const total = editedAdditionalCosts.reduce((acc, cost) => {
      const costPrice = parseFloat(cost.price) || 0;
      return acc + costPrice;
    }, 0);
    return total;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onLongPress={handleCancelContract}
    >
      <View style={styles.info}>
        <Text style={styles.label}>Khách hàng</Text>
        <Text style={styles.infoText}>{item.clientId.name}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Ngày ký</Text>
        <Text style={styles.infoText}>{formattedDateTime}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Tổng tiền</Text>
        <Text style={styles.infoText}>{formatCurrency(item.priceTotal)}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>Đã thanh toán</Text>
        <Text style={styles.infoText}>{formatCurrency(item.prepayment)}</Text>
      </View>

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
        <TouchableOpacity style={styles.editButton} onPress={toggleModalUpdate}>
          <Text style={styles.editButtonText}>Chỉnh sửa</Text>
          <AntDesign
            style={{ marginTop: 1 }}
            name="edit"
            size={18}
            color={"#4285f4"}
          />
        </TouchableOpacity>
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

      <Text
        style={[
          styles.status,
          {
            backgroundColor:
              item.status === "Chưa thanh toán"
                ? "#db9200"
                : item.status === "Đã hủy"
                ? "#b0b0b0"
                : "#4CAF50",
          },
        ]}
      >
        {item.status}
      </Text>

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
              data={["Người ký", "Ngày ký"]}
              style={styles.head}
              textStyle={styles.headText}
            />
            <Row
              data={[item.userId.name, formattedDateTime]}
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
              <Row data={["Dịch vụ", "Giá"]} textStyle={styles.headText} />
              {/* Lặp qua danh sách dịch vụ và thêm vào bảng */}
              {item.services.map((service, index) => (
                <Rows
                  key={index}
                  data={[
                    [
                      service.serviceId.name,
                      formatCurrency(service.serviceId.price),
                    ],
                  ]}
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
                  data={["Trang phục", "Giá", "Ngày mượn", "Ngày trả", "Mô tả"]}
                  textStyle={{ width: 120, ...styles.headerText }}
                />

                {/* Lặp qua danh sách trang phục và thêm vào bảng */}
                {item.weddingOutfit.map((outfit, index) => (
                  <Row
                    key={index}
                    data={[
                      outfit.weddingOutfitId.name,
                      formatCurrency(outfit.weddingOutfitId.price),
                      moment(outfit.rentalDate).format("DD/MM/yyyy"),
                      moment(outfit.returnDate).format("DD/MM/yyyy"),
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
                    <Text style={styles.boldText}>Giảm giá</Text>,
                    item.discount ? item.discount + "%" : "Không",
                  ],
                  [
                    <Text style={styles.boldText}>Chi phí phát sinh</Text>,
                    item.additionalCosts.length > 0
                      ? item.additionalCosts.map((cost, index) => (
                          <View key={index}>
                            <Row
                              data={[
                                [cost.description + ": "],
                                [formatCurrency(cost.price)],
                              ]}
                              textStyle={{ fontSize: 12 }}
                            />
                          </View>
                        ))
                      : "Không",
                  ],
                  [
                    <Text style={styles.boldText}>
                      Tổng tiền(Đã bao gồm chi phí phát sinh)
                    </Text>,
                    formatCurrency(item.priceTotal),
                  ],
                  [
                    <Text style={styles.boldText}>Đã thanh toán</Text>,
                    formatCurrency(item.prepayment),
                  ],
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
                  [
                    <Text style={styles.boldText}>Trạng thái</Text>,
                    item.status,
                  ],
                  [
                    <Text style={styles.boldText}>Cập nhật mới nhất</Text>,
                    moment(item.updatedAt).format("DD/MM/yyyy HH:mm"),
                  ],
                ]}
                textStyle={styles.text}
              />
            </Table>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.exportButton} onPress={exportPDF}>
          <Text style={styles.exportButtonText}>Xuất PDF </Text>
          <MaterialIcons
            style={{ marginTop: 1 }}
            name="picture-as-pdf"
            size={18}
            color={"red"}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      </Modal>

      {/* Modal chỉnh sửa hợp đồng*/}
      <Modal isVisible={isVisibleModalUpdates}>
        <View style={styles.modalContainer2}>
          <View style={{ padding: 10 }}>
            <Text
              style={{
                color: "#0e55a7",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              Chỉnh sửa hợp đồng
            </Text>

            <ScrollView style={{ height: "auto", marginBottom: 10 }}>
              {editedAdditionalCosts.map((cost, index) => (
                <View key={index}>
                  <TextInput
                    label={`Chi phí phát sinh ${index + 1}`}
                    mode="outlined"
                    value={cost.description}
                    onChangeText={(text) =>
                      handleDescriptionChange(text, index)
                    }
                  />
                  <TextInput
                    label={`Giá`}
                    mode="outlined"
                    value={formatCurrency(cost.price)}
                    onChangeText={(text) => handlePriceChange(text, index)}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={{ marginBottom: 18, marginTop: 5 }}
                    onPress={() => removeAdditionalCost(index)}
                  >
                    <Text
                      style={{
                        color: "red",
                        fontWeight: "bold",
                        alignSelf: "flex-end",
                      }}
                    >
                      Xóa chi phí phát sinh {index + 1}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={{
                borderRadius: 5,
                borderWidth: 1,
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              onPress={addAdditionalCost}
            >
              <Text>Thêm chi phí phát sinh</Text>
              <MaterialIcons name="add" size={20} />
            </TouchableOpacity>

            <Text style={{ fontWeight: "bold", padding: 10 }}>
              Tổng tiền(Bao gồm chi phí phát sinh):{" "}
              {formatCurrency(
                item.priceTotal + calculateAdditionalCostsTotal()
              )}
            </Text>

            <TextInput
              label="Thanh toán tất cả"
              value={formatCurrency(editedPrepayment)}
              mode="outlined"
              onChangeText={(text) =>
                setEditedPrepayment(text.replace(/[^0-9]/g, ""))
              }
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
              onPress={handleUpdateContract}
              style={styleModal.button2}
            >
              <Text style={styleModal.textButton2}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <SpinnerOverlay visible={loading}/>
    </TouchableOpacity>
  );
};

export default ItemListContract;

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
