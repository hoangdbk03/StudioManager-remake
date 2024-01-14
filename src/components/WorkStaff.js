import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import AxiosIntance from "../util/AxiosIntance";
import { useEffect } from "react";
import { useState } from "react";
import { IconButton, Searchbar } from "react-native-paper";
import { AppConText } from "../util/AppContext";
import ItemListWorkStaff from "./ItemListWorkStaff";
import unorm from "unorm";
import { format, isValid, parseISO } from "date-fns";
import { Image } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const WorkStaff = () => {
  const [dataWork, setDataWork] = useState([]);
  const { inforUser } = useContext(AppConText);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const onChangeSearch = (query) => setSearchQuery(query);

  // * mở lịch chọn
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  // ! lịch chọn thời gian để tìm kiếm
  const handleConfirmFindDate = (date) => {
    hideDatePicker();
    const formattedDate = format(date, "dd/MM/yyyy");
    setSearchQuery(formattedDate);
  };

  // TODO: lấy danh sách công việc
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get(
        `/work/user-work/${inforUser._id}`
      );
      const apiData = response;
      setDataWork(apiData);
    } catch (error) {
      console.log("Lỗi lấy danh sách công việc", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          style={{ borderRadius: 10, width: "100%" }}
          icon={() => <IconButton icon="calendar" onPress={showDatePicker} />}
        />

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmFindDate}
          onCancel={hideDatePicker}
        />
      </View>

      {filteredData.length > 0 ? (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ItemListWorkStaff item={item} onUpdate={fetchData} />}
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
    </View>
  );
};

export default WorkStaff;

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
