import {
  Alert,
  FlatList,
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
import { format, isValid, parseISO } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import ItemListContract from "./ItemListContract";
import SpinnerOverlay from "../items/SpinnerOverlay";
import { IconButton, Searchbar } from "react-native-paper";
import unorm from "unorm";

const Contract = () => {
  const { inforUser } = useContext(AppConText);
  const [loading, setLoading] = useState(false);
  const [refreshing, setrefreshing] = useState(false);
  const [isModalCreateVisible, setModalCreateVisible] = useState(false);
  const [isWorkDatePickerVisible, setWorkDatePickerVisible] = useState(false);
  const [isDeliveryDatePickerVisible, setDeliveryDatePickerVisible] =
    useState(false);
  const [workDate, setWorkDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // * Ngày hẹn chụp
  const showWorkDatePicker = () => {
    setWorkDatePickerVisible(true);
  };
  const hideWorkDatePicker = () => {
    setWorkDatePickerVisible(false);
  };
  const handleWorkDateConfirm = (date) => {
    setWorkDate(format(date, "HH:mm dd/MM/yyyy"));
    hideWorkDatePicker();
  };

  // * Ngày trả ảnh
  const showDeliveryDate = () => {
    setDeliveryDatePickerVisible(true);
  };
  const hideDeliveryDate = () => {
    setDeliveryDatePickerVisible(false);
  };
  const handleDeliveryDateConfirm = (date) => {
    setDeliveryDate(format(date, "dd/MM/yyyy"));
    hideDeliveryDate();
  };

  // * data tạo hợp đồng
  const [data, setData] = useState({
    discount: "",
    prepayment: "",
    location: "",
    note: "",
  });

  // * Phần hợp đồng
  const [dataContract, setDataContract] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const onChangeSearch = (query) => setSearchQuery(query);

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateConfirm = (date) => {
    hideDatePicker();
    const formattedDate = format(date, "dd/MM/yyyy");
    setSearchQuery(formattedDate);
    setSelectedDate(date);
  };

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
  const [rentalDate, setRentalDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [description, setDescription] = useState("");
  const [isInfoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null);
  const [isRentalDatePickerVisible, setRentalDatePickerVisible] =
    useState(false);
  const [isReturnDatePickerVisible, setReturnDatePickerVisible] =
    useState(false);

  // * mở modal chọn ngày thuê và trả
  const showRentalDatePicker = () => {
    setRentalDatePickerVisible(true);
  };
  const hideRentalDatePicker = () => {
    setRentalDatePickerVisible(false);
  };

  // * mở lịch chọn ngày thuê và trả
  const showReturnDatePicker = () => {
    setReturnDatePickerVisible(true);
  };
  const hideReturnDatePicker = () => {
    setReturnDatePickerVisible(false);
  };

  // * xác nhận
  const handleRentalDateConfirm = (date) => {
    setRentalDate(format(date, "dd/MM/yyyy"));
    hideRentalDatePicker();
  };
  const handleReturnDateConfirm = (date) => {
    setReturnDate(format(date, "dd/MM/yyyy"));
    hideReturnDatePicker();
  };

  const openInfoModal = (outfitId) => {
    setSelectedOutfitId(outfitId);
    setInfoModalVisible(true);
    setRentalDate(null);
    setReturnDate(null);
    setDescription("");
  };

  const closeInfoModal = () => {
    setInfoModalVisible(false);
  };

  const confirmInfoModal = () => {
    if (!rentalDate || !returnDate) {
      Alert.alert("Thông báo", "Vui lòng chọn ngày thuê và ngày trả!");
      return;
    }
    const updatedDataOutfitSelected = dataOutfitSelected.map((outfit) =>
      outfit._id === selectedOutfitId
        ? {
            ...outfit,
            rentalDate,
            returnDate,
            description,
          }
        : outfit
    );

    setDataOutfitSelected(updatedDataOutfitSelected);
    closeInfoModal();
  };

  const toggleModalCreate = () => {
    setModalCreateVisible(!isModalCreateVisible);
    setDataClientSelected();

    setData({
      prepayment: "",
    });

    // reset dịch vụ
    setSelectedServices([]);
    setDataServiceSelected([]);

    // reset trang phục
    setSelectedOutfit([]);
    setDataOutfitSelected([]);

    // reset ngày
    setWorkDate("");
    setDeliveryDate("");
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
      const apiData = response.filter(client => client.disable === false);
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
  // TODO: lấy danh sách hợp đồng
  const fetchDataContract = async () => {
    try {
      const response = await AxiosIntance().get("/contract/list/");
      const apiData = response;
      setDataContract(apiData);
    } catch (error) {
      console.log("Lỗi lấy danh sách hợp đồng");
    }
  };
  // Gọi lại hàm fetchDataContract khi hợp đồng được cập nhật
  const onContractUpdated = () => {
    fetchDataContract();
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
      fetchDataContract();
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

    // giảm giá theo %
    const discount = parseFloat(data.discount) || 0;
    const discountedTotal = totalPrice - (totalPrice * discount) / 100;

    return discountedTotal;
  };

  // TODO: xử lý api tạo hợp đồng
  const handleCreateContract = async () => {
    setLoading(true);
    const totalPrice = calculateTotalPrice();
    if (
      !selectedClient ||
      !selectedServices ||
      !workDate ||
      !deliveryDate ||
      !dataOutfitSelected
    ) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const outfitData = dataOutfitSelected.map((outfit) => ({
      weddingOutfitId: outfit._id,
      rentalDate: outfit.rentalDate,
      returnDate: outfit.returnDate,
      description: outfit.description,
    }));
    const serviceData = selectedServices.map((service) => ({
      serviceId: service,
    }));
    const dataCreateContract = {
      userId: inforUser._id,
      clientId: selectedClient,
      services: serviceData,
      weddingOutfit: outfitData,
      workDate: workDate,
      deliveryDate: deliveryDate,
      note: data.note || "",
      location: data.location,
      discount: data.discount,
      prepayment: data.prepayment,
      priceTotal: totalPrice,
    };

    try {
      await AxiosIntance().post("/contract/create/", dataCreateContract);
      fetchDataContract();
      Toast.show({
        type: "success",
        text1: "Tạo hợp đồng thành công",
      });
      setLoading(false);
      toggleModalCreate();
    } catch (error) {
      setLoading(false);
      toggleModalCreate();
      Toast.show({
        type: "error",
        text1: "Tạo hợp đồng thất bại",
      });
      console.log("Lỗi tạo hợp đồng", error);
    }
  };

  // Chuẩn hóa chuỗi sang Unicode NFD
  const normalizedSearchQuery = unorm.nfkd(searchQuery.toLowerCase());

  // tìm dữ liệu dựa trên chuỗi tìm kiếm đã được chuẩn hóa
  const filteredData = dataContract.filter((item) => {
    const normalizedDataName = unorm.nfkd(item.clientId.name.toLowerCase());

    // Chuyển đổi chuỗi ngày thành đối tượng ngày
    const contractDate = parseISO(item.signingDate);

    // Kiểm tra nếu ngày ký hợp đồng hợp lệ và có chứa chuỗi tìm kiếm
    const isDateValid = isValid(contractDate);
    const isDateMatch =
      isDateValid &&
      format(contractDate, "dd/MM/yyyy").includes(normalizedSearchQuery);

    return normalizedDataName.includes(normalizedSearchQuery) || isDateMatch;
  });

  // * xử lý load data khi kéo xuống
  const handleRefreshData = async () => {
    setrefreshing(true);
    try {
      await fetchDataContract(); // Chờ fetchData hoàn thành
      // Hiển thị thông báo cập nhật thành công
      Toast.show({
        type: "success",
        text1: "Cập nhật lại danh sách thành công",
      });
    } catch (error) {
      console.log("Lỗi khi cập nhật", error);
    } finally {
      setrefreshing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          padding: 10,
        }}
      >
        <Searchbar
          placeholder="Tìm kiếm"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={{ borderRadius: 10, width: "82%" }}
          icon={() => <IconButton icon="calendar" onPress={showDatePicker} />}
        />
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />
        {/* Floating button */}
        <TouchableOpacity style={styles.fab} onPress={toggleModalCreate}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ height: 60 }}>
        <ScrollView horizontal style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "Tất cả" && styles.activeFilterButton,
            ]}
            onPress={() => setFilterStatus("Tất cả")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "Tất cả" && styles.activeFilterButtonText,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "Chưa thanh toán" && styles.activeFilterButton2,
            ]}
            onPress={() => setFilterStatus("Chưa thanh toán")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "Chưa thanh toán" &&
                  styles.activeFilterButtonText,
              ]}
            >
              Chưa thanh toán
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "Đã thanh toán" && styles.activeFilterButton3,
            ]}
            onPress={() => setFilterStatus("Đã thanh toán")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "Đã thanh toán" &&
                  styles.activeFilterButtonText,
              ]}
            >
              Đã thanh toán
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterStatus === "Đã hủy" && styles.activeFilterButton4,
            ]}
            onPress={() => setFilterStatus("Đã hủy")}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === "Đã hủy" && styles.activeFilterButtonText,
              ]}
            >
              Đã hủy
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Danh sách hợp đồng */}
      {filteredData.length > 0 ? (
        <FlatList
          refreshing={refreshing}
          onRefresh={handleRefreshData}
          style={{ backgroundColor: "white", marginBottom: "21%" }}
          data={
            filterStatus === "Tất cả"
              ? filteredData
              : dataContract.filter(
                  (item) =>
                    (filterStatus === "Chưa thanh toán" &&
                      item.status === "Chưa thanh toán") ||
                    (filterStatus === "Đã thanh toán" &&
                      item.status === "Đã thanh toán") ||
                    (filterStatus === "Đã hủy" && item.status === "Đã hủy")
                )
          }
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ItemListContract
              item={item}
              onContractUpdated={onContractUpdated}
            />
          )}
        />
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            marginBottom: "21%"
          }}
        >
          <View
            style={{
              width: 150,
              height: 150,
              backgroundColor: "#e7eef6",
              borderRadius: 300,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Image
              style={{ width: 60, height: 60, tintColor: "#b4cae4" }}
              source={require("../img/taskList.png")}
            />
          </View>
          <Text style={{ color: "#545454", marginTop: 10 }}>
            Không có hợp đồng nào
          </Text>
        </View>
      )}

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
                  openInfoModal(item.value._id);
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

            <Modal isVisible={isInfoModalVisible}>
              <View style={{ backgroundColor: "white", padding: 10 }}>
                {/* Thông tin ngày thuê, ngày trả, mô tả */}
                <TextInput
                  label="Ngày thuê"
                  mode="outlined"
                  style={{ marginTop: 10 }}
                  placeholder="dd/MM/yyyy"
                  value={rentalDate}
                  onPressIn={showRentalDatePicker}
                />

                <TextInput
                  label="Ngày trả"
                  mode="outlined"
                  style={{ marginTop: 10 }}
                  placeholder="dd/MM/yyyy"
                  value={returnDate}
                  onPressIn={showReturnDatePicker}
                />

                <TextInput
                  label="Mô tả"
                  mode="outlined"
                  style={{ marginTop: 10 }}
                  multiline={true}
                  numberOfLines={6}
                  value={description}
                  onChangeText={(text) => setDescription(text)}
                />

                {/* Lịch chọn ngày thuê và trả */}
                <DateTimePickerModal
                  isVisible={isRentalDatePickerVisible}
                  mode="date"
                  onConfirm={handleRentalDateConfirm}
                  onCancel={hideRentalDatePicker}
                />

                <DateTimePickerModal
                  isVisible={isReturnDatePickerVisible}
                  mode="date"
                  onConfirm={handleReturnDateConfirm}
                  onCancel={hideReturnDatePicker}
                />

                {/* Nút xác nhận và đóng modal */}
                <TouchableOpacity
                  onPress={confirmInfoModal}
                  style={{
                    backgroundColor: "#0E55A7",
                    padding: 10,
                    borderRadius: 5,
                    marginTop: 10,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>
                    Xác nhận
                  </Text>
                </TouchableOpacity>
              </View>
            </Modal>

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
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày thuê:</Text>
                        <Text style={styles.infoText}>{outfit.rentalDate}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Ngày trả:</Text>
                        <Text style={styles.infoText}>{outfit.returnDate}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Mô tả:</Text>
                        <Text style={styles.infoText}>
                          {outfit.description}
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
              Tổng cộng: {formatCurrency(calculateTotalPrice())}
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
              onPressIn={showWorkDatePicker}
              placeholder="HH:mm dd/MM/yyyy"
              value={workDate}
            />
            <DateTimePickerModal
              isVisible={isWorkDatePickerVisible}
              mode="datetime"
              onConfirm={handleWorkDateConfirm}
              onCancel={hideWorkDatePicker}
            />

            <TextInput
              label="Ngày trả ảnh"
              mode="outlined"
              style={{ marginTop: 10 }}
              onPressIn={showDeliveryDate}
              placeholder="dd/MM/yyyy"
              value={deliveryDate}
            />
            <DateTimePickerModal
              isVisible={isDeliveryDatePickerVisible}
              mode="date"
              onConfirm={handleDeliveryDateConfirm}
              onCancel={hideDeliveryDate}
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
      <SpinnerOverlay visible={loading} />
    </View>
  );
};

export default Contract;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  filterContainer: {
    marginVertical: 10,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginHorizontal: 5,
    backgroundColor: "#E0E0E0",
    height: 35,
  },
  activeFilterButton: {
    backgroundColor: "#0E55A7",
  },
  activeFilterButton2: {
    backgroundColor: "#db9200",
  },
  activeFilterButton3: {
    backgroundColor: "#4CAF50",
  },
  activeFilterButton4: {
    backgroundColor: "#b0b0b0",
  },
  filterButtonText: {
    color: "#333",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  fab: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0E55A7",
    borderRadius: 18,
    elevation: 8,
  },
});
