import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useContext, useEffect, useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { AppConText } from "../util/AppContext";
import { styleModal } from "../style/styleModal";
import { Dropdown } from "react-native-element-dropdown";
import AxiosIntance from "../util/AxiosIntance";
import { TextInput } from "react-native-paper";
import AntDesign from "react-native-vector-icons/AntDesign";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";

const Contract = () => {
  const { inforUser } = useContext(AppConText);
  const [isModalCreateVisible, setModalCreateVisible] = useState(false);

  // * data tạo hợp đồng
  const [data, setData] = useState({
    userId: inforUser._id,
    discount: "",
    prepayment: "",
    location: "",
    note: "",
  });

  // * Phần của khách hàng
  const [dataClient, setDataClient] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [dataClientSelected, setDataClientSelected] = useState([]);
  const [showClientInfo, setShowClientInfo] = useState(false);

  // * Phần của dịch vụ
  const [dataService, setDataService] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [dataServiceSelected, setDataServiceSelected] = useState([]);
  const [showServiceInfo, setShowServiceInfo] = useState(false);

  // * Phần của trang phục
  const [dataOutfit, setDataOutfit] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState([]);
  const [dataOutfitSelected, setDataOutfitSelected] = useState([]);
  const [showOutfitInfo, setShowOutfitInfo] = useState(false);

  const toggleModalCreate = () => {
    setModalCreateVisible(!isModalCreateVisible);
    setDataClientSelected();

    // reset dịch vụ
    setSelectedServices([]);
    setDataServiceSelected([]);

    // reset trang phục
    setSelectedOutfit([]);
    setDataOutfitSelected([]);
  };

  // * định dạng lại tiền việt
  const formatCurrency = (amount) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formatter.format(amount);
  };

  // TODO: lấy danh sách khách hàng
  const fetchDataClient = async () => {
    try {
      const response = await AxiosIntance().get("/client/list");
      const apiData = response;
      setDataClient(apiData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khách hàng ở hợp đồng", error);
    }
  };
  // TODO: lấy danh sách dịch vụ
  const fetchDataService = async () => {
    try {
      const response = await AxiosIntance().get("/service/list");
      const apiData = response;
      setDataService(apiData);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ ở hợp đồng", error);
    }
  };
  const isServiceSelected = (serviceId) => {
    return selectedServices.includes(serviceId);
  };

  // * xóa dịch vụ được chọn
  const removeSelectedService = (serviceId) => {
    // Lọc ra danh sách dịch vụ đã chọn mà không chứa serviceId
    const updatedSelectedServices = selectedServices.filter(
      (id) => id !== serviceId
    );

    // Lọc ra danh sách dịch vụ đã chọn mà không chứa service với serviceId
    const updatedDataServiceSelected = dataServiceSelected.filter(
      (service) => service._id !== serviceId
    );

    // Cập nhật state
    setSelectedServices(updatedSelectedServices);
    setDataServiceSelected(updatedDataServiceSelected);

    // Nếu không có dịch vụ nào được chọn, ẩn thông tin dịch vụ
    if (updatedSelectedServices.length === 0) {
      setShowServiceInfo(false);
    }
  };

  // TODO: Lấy danh sách trang phục
  const fetchDataOutfit = async () => {
    try {
      const response = await AxiosIntance().get("/WeddingOutfit/list/");
      const apiData = response;
      // Lọc những trang phục có status là "Sẵn sàng"
      const availableOutfits = apiData.filter(
        (outfit) => outfit.status === "Sẵn sàng"
      );

      setDataOutfit(availableOutfits);
    } catch (error) {
      console.log("Không thể lấy danh sách trang phục ở Contract");
    }
  };
  const isOutfitSelected = (outfitId) => {
    return selectedOutfit.includes(outfitId);
  };

  // * xóa trang phục được chọn
  const removeSelectedOutfit = (outfitId) => {
    // Lọc ra danh sách trang phục đã chọn mà không chứa trang phục cần xóa
    const updatedSelectedOutfits = selectedOutfit.filter(
      (id) => id !== outfitId
    );

    // Lọc ra danh sách trang phục đã chọn mà không chứa trang phục với outfitId
    const updatedDataOutfitSelected = dataOutfitSelected.filter(
      (outfit) => outfit._id !== outfitId
    );

    // Cập nhật state
    setSelectedOutfit(updatedSelectedOutfits);
    setDataOutfitSelected(updatedDataOutfitSelected);

    // Nếu không có trang phục nào được chọn, ẩn thông tin trang phục
    if (updatedSelectedOutfits.length === 0) {
      setShowOutfitInfo(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDataClient();
      fetchDataService();
      fetchDataOutfit();
    }, [])
  );

  // tính tổng tiền
  const calculateTotalPrice = () => {
    let totalPrice = 0;

    // Tính tổng giá trị price của dịch vụ đã chọn
    selectedServices.forEach((serviceId) => {
      const selectedService = dataServiceSelected.find(
        (service) => service._id === serviceId
      );
      if (selectedService) {
        totalPrice += selectedService.price;
      }
    });

    // Tính tổng giá trị price của trang phục đã chọn
    selectedOutfit.forEach((outfitId) => {
      const selectedOutfit = dataOutfitSelected.find(
        (outfit) => outfit._id === outfitId
      );
      if (selectedOutfit) {
        totalPrice += selectedOutfit.price;
      }
    });

    return formatCurrency(totalPrice);
  };

  const handleCreateContract = async () => {};

  return (
    <View style={styles.container}>
      {/* Floating button */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.floatingAdd}
        onPress={toggleModalCreate}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Modal tạo hợp đồng */}
      <Modal isVisible={isModalCreateVisible}>
        <View style={styles.containerModal}>
          <ScrollView>
            <Text style={styles.titleModal}>Tạo hợp đồng</Text>
            {/* Phần chọn khách hàng */}
            <Dropdown
              search
              searchPlaceholder="Tìm kiếm..."
              style={styles.dropdown}
              placeholder="Chọn khách hàng"
              value={selectedClient}
              onChange={(item) => {
                setSelectedClient(item.value._id);
                setDataClientSelected(item.value);
                setShowClientInfo(true);
              }}
              data={dataClient.map((client) => ({
                label: `${client.name}\n\nSố điện thoại: ${
                  client.phone
                }\nSố điện thoại phụ: ${
                  client.phone2 ? client.phone2 : "Chưa cập nhật"
                }`,
                value: client,
              }))}
              labelField="label"
              valueField="value"
              placeholderStyle={{ marginStart: 14 }}
              itemContainerStyle={{
                borderWidth: 1,
                borderColor: "#b0b0b0",
                margin: 5,
                borderRadius: 5,
              }}
              itemTextStyle={{ fontWeight: "400", color: "#062446" }}
            />

            {/* Phần chọn dịch vụ */}
            <Dropdown
              search
              searchPlaceholder="Tìm kiếm..."
              style={styles.dropdown}
              placeholder="Chọn dịch vụ"
              value={selectedServices}
              onChange={(item) => {
                const serviceId = item.value._id;

                if (isServiceSelected(serviceId)) {
                  // Hiển thị thông báo Alert khi dịch vụ đã được chọn trước đó
                  Alert.alert("Thông báo", "Bạn đã chọn dịch vụ này rồi!");
                } else {
                  // Nếu chưa chọn, thêm vào danh sách đã chọn
                  setSelectedServices((prevSelected) => [
                    ...prevSelected,
                    serviceId,
                  ]);
                  setDataServiceSelected((prevData) => [
                    ...prevData,
                    item.value,
                  ]);
                  setShowServiceInfo(true);
                }
              }}
              data={dataService.map((service) => ({
                label: `${service.name}\n\nGiá: ${formatCurrency(
                  service.price
                )}`,
                value: service,
              }))}
              labelField="label"
              valueField="value"
              renderItem={(item, index) => (
                <View style={styles.optionContainer}>
                  <Image
                    source={{ uri: item.value.image }}
                    style={styles.optionImage}
                  />
                  <Text>{item.label}</Text>
                </View>
              )}
              placeholderStyle={{ marginStart: 14 }}
              selectedTextStyle={{ marginTop: 6, marginStart: 14 }}
              itemContainerStyle={{
                borderWidth: 1,
                borderColor: "#b0b0b0",
                margin: 5,
                borderRadius: 5,
              }}
              itemTextStyle={{ fontWeight: "400", color: "#062446" }}
            />

            {/* Phần chọn trang phục */}
            <Dropdown
              search
              searchPlaceholder="Tìm kiếm..."
              style={styles.dropdown}
              placeholder="Chọn trang phục"
              value={selectedOutfit}
              onChange={(item) => {
                const outfitId = item.value._id;
                if (isOutfitSelected(outfitId)) {
                  Alert.alert("Thông báo", "Bạn đã chọn trang phục này rồi!");
                } else {
                  setSelectedOutfit((prevSelected) => [
                    ...prevSelected,
                    outfitId,
                  ]);
                  setDataOutfitSelected((prevData) => [
                    ...prevData,
                    item.value,
                  ]);
                  setShowOutfitInfo(true);
                }
              }}
              data={dataOutfit.map((outfit) => ({
                label: `${outfit.name}\n\nKích cỡ: ${outfit.size}\nMàu: ${
                  outfit.color
                }\nGiá: ${formatCurrency(outfit.price)}`,
                value: outfit,
              }))}
              labelField="label"
              valueField="value"
              renderItem={(item, index) => (
                <View style={styles.optionContainer}>
                  <Image
                    source={{ uri: item.value.image }}
                    style={styles.optionImage}
                  />
                  <Text>{item.label}</Text>
                </View>
              )}
              placeholderStyle={{ marginStart: 14 }}
              selectedTextStyle={{ marginTop: 6, marginStart: 14 }}
              itemContainerStyle={{
                borderWidth: 1,
                borderColor: "#b0b0b0",
                margin: 5,
                borderRadius: 5,
              }}
              itemTextStyle={{ fontWeight: "400", color: "#062446" }}
            />

            {/* Tất cả thông tin đã chọn khách hàng, dịch vụ, trang phục*/}
            {/* Thông tin khách hàng đã chọn*/}
            {showClientInfo && dataClientSelected && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Thông tin khách hàng</Text>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Tên khách hàng:</Text>
                  <Text style={styles.infoText}>{dataClientSelected.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={styles.infoText}>
                    {dataClientSelected.phone}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại phụ:</Text>
                  <Text style={styles.infoText}>
                    {dataClientSelected.phone2 || "Chưa cập nhật"}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Địa chỉ:</Text>
                  <Text style={styles.infoText}>
                    {dataClientSelected.address}
                  </Text>
                </View>
              </View>
            )}
            {/* Thông tin dịch vụ đã chọn*/}
            {showServiceInfo && dataServiceSelected.length > 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Thông tin dịch vụ</Text>
                {dataServiceSelected.map((service, index) => (
                  <View
                    key={service._id}
                    style={{
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.infoRow} key={service._id}>
                        <Text style={styles.infoLabel}>
                          Dịch vụ {index + 1}:
                        </Text>
                        <Text style={styles.infoText}>{service.name}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Giá:</Text>
                        <Text style={styles.infoText}>
                          {formatCurrency(service.price)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeSelectedService(service._id)}
                      style={{
                        marginLeft: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign name="close" size={20} color={"red"} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {/* Thông tin trang phục đã chọn */}
            {showOutfitInfo && dataOutfitSelected.length > 0 && (
              <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Thông tin trang phục</Text>

                {dataOutfitSelected.map((outfit, index) => (
                  <View
                    key={outfit._id}
                    style={{
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                          Trang phục {index + 1}:
                        </Text>
                        <Text style={styles.infoText}>{outfit.name}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Kích cỡ:</Text>
                        <Text style={styles.infoText}>{outfit.size}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Màu sắc:</Text>
                        <Text style={styles.infoText}>{outfit.color}</Text>
                      </View>

                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Giá:</Text>
                        <Text style={styles.infoText}>
                          {formatCurrency(outfit.price)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeSelectedOutfit(outfit._id)}
                      style={{
                        marginLeft: 10,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AntDesign name="close" size={20} color={"red"} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Tổng tiền */}
            <Text style={styles.totalPriceText}>
              Tổng cộng: {calculateTotalPrice()}
            </Text>

            <TextInput
              label="Giảm giá (%)"
              mode="outlined"
              keyboardType="numeric"
              style={{ marginTop: 10 }}
              onChangeText={(text) => {
                setData({ ...data, discount: text });
              }}
            />

            <TextInput
              label="Đã thanh toán"
              keyboardType="numeric"
              mode="outlined"
              style={{ marginTop: 10 }}
              value={formatCurrency(data.prepayment)}
              onChangeText={(text) => {
                setData({ ...data, prepayment: text.replace(/[^0-9]/g, "") });
              }}
            />

            <TextInput
              label="Ngày hẹn chụp"
              mode="outlined"
              style={{ marginTop: 10 }}
              // onPressIn={toggleDatePicker}
              placeholder="00:00 dd-MM-yyyy"
            />

            <TextInput
              label="Ngày trả ảnh"
              mode="outlined"
              style={{ marginTop: 10 }}
              // onPressIn={toggleDatePicker}
              placeholder="dd-MM-yyyy"
            />

            <TextInput
              label="Địa điểm chụp"
              mode="outlined"
              style={{ marginTop: 10 }}
              onChangeText={(text) => {
                setData({ ...data, location: text });
              }}
            />

            <TextInput
              label="Ghi chú hợp đồng..."
              mode="outlined"
              style={{ marginTop: 10 }}
              multiline={true}
              numberOfLines={6}
              onChangeText={(text) => {
                setData({ ...data, note: text });
              }}
            />
          </ScrollView>
        </View>

        {/* Phần 2 nút nhấn của modal */}
        <View
          style={[
            styleModal.buttonModal,
            { backgroundColor: "white", borderRadius: 5 },
          ]}
        >
          <TouchableOpacity
            onPress={toggleModalCreate}
            style={styleModal.button1}
          >
            <Text style={styleModal.textButton1}>Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styleModal.button2}
            onPress={handleCreateContract}
          >
            <Text style={styleModal.textButton2}>Tạo</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default Contract;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingAdd: {
    position: "absolute",
    bottom: 150,
    right: 20,
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    width: 56,
    height: 56,
    backgroundColor: "#0E55A7",
  },
  titleModal: {
    width: "100%",
    textAlign: "center",
    padding: 20,
    color: "#0e55a7",
    fontWeight: "bold",
    fontSize: 20,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#b0b0b0",
  },
  containerModal: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 4,
    padding: 10,
  },
  modalOutfit: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
  },
  closeButton: {
    backgroundColor: "#0E55A7",
    borderRadius: 5,
    padding: 10,
    margin: 10,
    alignItems: "center",
  },

  dropdown: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#b0b0b0",
    borderRadius: 5,
    marginTop: 10,
  },
  infoContainer: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    borderRadius: 5,
    padding: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0e55a7",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#062446",
  },
  infoText: {
    fontSize: 14,
    color: "#062446",
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  optionImage: {
    width: 40,
    height: 80,
    marginRight: 10,
  },
  totalPriceText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    alignSelf: "flex-end",
  },
});
