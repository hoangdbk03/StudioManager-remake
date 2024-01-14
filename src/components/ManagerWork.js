import { Alert, FlatList, Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { styleModal } from "../style/styleModal";
import { TextInput } from "react-native-paper";
import AxiosIntance from "../util/AxiosIntance";
import { useEffect } from "react";
import ItemListWork from "./ItemListWork";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import { IconButton, Searchbar } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { format, isValid, parseISO } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Toast from "react-native-toast-message";
import SpinnerOverlay from "../items/SpinnerOverlay";
import unorm from "unorm";

const ManagerWork = () => {
  const [dataWork, setDataWork] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isVisibleModalAdd, setVisibleModalAdd] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isDatePickerFindVisible, setDatePickerFindVisibility] = useState(false);
  const [refreshing, setrefreshing] = useState(false);

  // * lưu các dữ liệu khác
  const [dataTypeWork, setDataTypeWork] = useState([]);
  const [dataStaff, setDataStaff] = useState([]);
  const [labelWork, setLabelWork] = useState("");
  const [labelStaff, setLabelStaff] = useState("");

  // * dữ liệu được chọn để thêm công việc
  const [selectedWork, setSelectedWork] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // * tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  const toggleModalAdd = () => {
    setVisibleModalAdd(!isVisibleModalAdd);
    setDataStaff([]);
    setSelectedDate();
    setSelectedWork();
    setSelectedStaff();
    setLabelWork();
    setLabelStaff();
  };

  // ! lịch chọn thời gian làm việc
  const showDatePickerFind = () => {
    setDatePickerFindVisibility(true);
  };
  const hideDatePickerFind = () => {
    setDatePickerFindVisibility(false);
  };
  const handleConfirmDate = (date) => {
    setLoading(true);
    hideDatePicker();
    setSelectedDate(date);
    fetchDataStaffByDate();
  };

  // ! lịch chọn thời gian để tìm kiếm

const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirmFindDate = (date) => {
    hideDatePicker();
    const formattedDate = format(date, "dd/MM/yyyy");
    setSearchQuery(formattedDate);
  };

  // TODO: lấy danh sách công việc
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get("/work/list-work");
      const apiData = response;
      setDataWork(apiData);
      setrefreshing(false);
    } catch (error) {
      setrefreshing(false);
      console.log("Lỗi lấy danh sách công việc", error);
    }
  };

  // TODO: lấy danh sách loại công việc
  const fetchDataTypeWork = async () => {
    try {
      const response = await AxiosIntance().get("/work/list");
      const apiData = response;
      setDataTypeWork(apiData);
    } catch (error) {
      console.log("Lỗi gọi danh sách loại công việc ở công việc", error);
    }
  };

  // TODO: lấy danh sách nhân viên theo ngày
  const fetchDataStaffByDate = async () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy");

      try {
        const response = await AxiosIntance().get(
          `/work/list-user-add-work?date=${formattedDate}`
        );
        const managerUsers = response.filter(
          (user) => user.role === "Nhân viên"
        );
        const apiData = managerUsers.map((user) => ({
          _id: user._id,
          name: user.name,
          job: user.job,
        }));
        setDataStaff(apiData);
        setLoading(false);
      } catch (error) {
        console.log("Lỗi lấy danh sách nhân viên theo ngày", error);
      }
    }
  };
  useEffect(() => {
    fetchDataStaffByDate();
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
    fetchDataTypeWork();
  }, []);

  // TODO: xử lý thêm công việc
  const handleCreateWork = async () => {
    try {
      if ((!selectedWork, !selectedStaff, !selectedDate, !address)) {
        Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
        return;
      }
      setLoading(true);

      const formattedDate = format(selectedDate, "HH:mm dd/MM/yyyy");
      const data = {
        workType_ID: selectedWork,
        user_ID: selectedStaff,
        workDate: formattedDate,
        address: address,
        note: note,
      };
      await AxiosIntance().post("/work/add-work", data);
      fetchData();
      toggleModalAdd();
      Toast.show({
        type: "success",
        text1: "Tạo công việc cho nhân viên thành công",
      });
      setLoading(false);
    } catch (error) {
      console.log("Lỗi tạo công việc cho nhân viên", error);
      Toast.show({
        type: "error",
        text1: "Tạo công việc cho nhân viên thất bại",
      });
    }
  };

  // Chuẩn hóa chuỗi sang Unicode NFD
  const normalizedSearchQuery = unorm.nfkd(searchQuery.toLowerCase());

  // Lọc dữ liệu dựa trên chuỗi tìm kiếm đã được chuẩn hóa
  const filteredData = dataWork.filter((item) => {
    const normalizedDataNameWork = unorm.nfkd(
      item.workType_ID.name.toLowerCase()
    );
    const normalizedDataName = unorm.nfkd(item.user_ID.name.toLowerCase());

    // Chuyển đổi chuỗi ngày thành đối tượng ngày
    const contractDate = parseISO(item.workDate);

    // Kiểm tra nếu ngày ký hợp đồng hợp lệ và có chứa chuỗi tìm kiếm
    const isDateValid = isValid(contractDate);
    const isDateMatch =
      isDateValid &&
      format(contractDate, "dd/MM/yyyy").includes(normalizedSearchQuery);

    return (
      normalizedDataName.includes(normalizedSearchQuery) ||
      normalizedDataNameWork.includes(normalizedSearchQuery) ||
      isDateMatch
    );
  });

  // * xử lý load data khi kéo xuống
  const handleRefreshData = async () => {
    setrefreshing(true);
    try {
      await fetchData(); // Chờ fetchData hoàn thành
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
      <SpinnerOverlay visible={loading} />
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
          icon={() => <IconButton icon="calendar" onPress={showDatePickerFind} />}
        />
        <DateTimePickerModal
          isVisible={isDatePickerFindVisible}
          mode="date"
          onConfirm={handleConfirmFindDate}
          onCancel={hideDatePickerFind}
        />

        {/* Floating button */}
        <TouchableOpacity style={styles.fab} onPress={toggleModalAdd}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      {filteredData.length > 0 ? (
        <FlatList
          refreshing={refreshing}
          onRefresh={handleRefreshData}
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ItemListWork
              item={item}
              onDelete={fetchData}
              onUpdate={fetchData}
            />
          )}
          style={{ marginBottom: "21%" }}
        />
      ) : (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            marginBottom: "21%",
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
            Không có công việc nào
          </Text>
        </View>
      )}

      {/* Modal thêm công việc */}
      <Modal isVisible={isVisibleModalAdd}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.titleModal}>Thêm công việc mới</Text>
            {/* Drop danh sách loại công việc */}
            <Dropdown
              search
              searchPlaceholder="Tìm kiếm..."
              labelField="label"
              valueField="value"
              data={dataTypeWork.map((item) => ({
                value: item._id,
                label: item.name,
              }))}
              onChange={(item) => {
                setSelectedWork(item.value);
                setLabelWork(item.label);
              }}
              placeholder={labelWork || "Chọn công việc"}
              placeholderStyle={{ marginStart: 10 }}
              containerStyle={{ borderRadius: 5 }}
              selectedTextStyle={{ marginStart: 10 }}
              style={styles.dropdown}
            />

            <TextInput
              label="Chọn thời gian làm việc"
              mode="outlined"
              style={styles.textInput}
              onPressIn={showDatePicker}
              value={
                selectedDate ? format(selectedDate, "HH:mm dd/MM/yyyy") : ""
              }
            />
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="datetime"
              onConfirm={handleConfirmDate}
              onCancel={hideDatePicker}
            />

            <Dropdown
              search
              searchPlaceholder="Tìm kiếm..."
              valueField="value"
              labelField="label"
              data={dataStaff.map((item) => ({
                value: item._id,
                label: `${item.name}\nNhân viên: ${item.job}`,
                name: item.name,
              }))}
              onChange={(item) => {
                setSelectedStaff(item.value);
                setLabelStaff(item.name);
              }}
              placeholder={labelStaff || "Chọn nhân viên"}
              placeholderStyle={{ marginStart: 10 }}
              containerStyle={{ borderRadius: 5 }}
              selectedTextStyle={{ marginStart: 10 }}
              style={[styles.dropdown]}
            />

            <TextInput
              label="Địa điểm làm việc"
              mode="outlined"
              style={styles.textInput}
              onChangeText={setAddress}
            />
            <TextInput
              label="Ghi chú"
              mode="outlined"
              style={styles.textInput}
              onChangeText={setNote}
            />
          </View>

          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalAdd}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateWork}
              style={styleModal.button2}
            >
              <Text style={styleModal.textButton2}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManagerWork;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 5,
  },
  modalContent: {
    padding: 10,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#888",
    marginTop: 10,
  },
  textInput: {
    marginTop: 5,
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
