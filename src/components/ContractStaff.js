import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import AxiosIntance from "../util/AxiosIntance";
import { format, isValid, parseISO } from "date-fns";
import { useFocusEffect } from "@react-navigation/native";
import { IconButton, Searchbar } from "react-native-paper";
import { useCallback } from "react";
import ItemListContractStaff from "./ItemListContractStaff";
import unorm from "unorm";
import { ScrollView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const ContractStaff = () => {
  const [dataContract, setDataContract] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");
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

  // TODO: lấy danh sách hợp đồng
  const fetchDataContract = async () => {
    try {
      const response = await AxiosIntance().get("/contract/list/");
      const apiData = response;
      const filteredContracts = apiData.filter(
        (item) => item.status !== "Đã hủy"
      );

      setDataContract(filteredContracts);
    } catch (error) {
      console.log("Lỗi lấy danh sách hợp đồng");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDataContract();
    }, [])
  );

  // Chuẩn hóa chuỗi sang Unicode NFD
  const normalizedSearchQuery = unorm.nfkd(searchQuery.toLowerCase());

  // Lọc dữ liệu dựa trên chuỗi tìm kiếm đã được chuẩn hóa
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
          onConfirm={handleDateConfirm}
          onCancel={hideDatePicker}
        />
      </View>

      <View style={{ height: 60, alignItems: "center" }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
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
        </ScrollView>
      </View>

      {/* Danh sách hợp đồng */}
      {filteredData.length > 0 ? (
        <FlatList
          style={{ backgroundColor: "white", marginBottom: "21%" }}
          data={
            filterStatus === "Tất cả"
              ? filteredData
              : dataContract.filter(
                  (item) =>
                    (filterStatus === "Chưa thanh toán" &&
                      item.status === "Chưa thanh toán") ||
                    (filterStatus === "Đã thanh toán" &&
                      item.status === "Đã thanh toán")
                )
          }
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ItemListContractStaff item={item} />}
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
            Không có hợp đồng nào
          </Text>
        </View>
      )}
    </View>
  );
};

export default ContractStaff;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  activeFilterButtonText: {
    color: "#fff",
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
  filterButtonText: {
    color: "#333",
  },
});
