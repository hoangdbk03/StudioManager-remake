import { FlatList, StyleSheet, Text, View } from "react-native";
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

const ManagerWork = () => {
  const [dataWork, setDataWork] = useState([]);
  const [isVisibleModalAdd, setVisibleModalAdd] = useState(false);

  const [dataTypeWork, setDataTypeWork] = useState([]);
  const [dataStaff, setDataStaff] = useState([]);

  const toggleModalAdd = () => {
    setVisibleModalAdd(!isVisibleModalAdd);
  };

  // TODO: lấy danh sách công việc
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get("/work/list-work");
      const apiData = response;
      setDataWork(apiData);
    } catch (error) {
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

  useEffect(() => {
    fetchData();
    fetchDataTypeWork();
  }, []);

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
          // onChangeText={onChangeSearch}
          // value={searchQuery}
          style={{ borderRadius: 10, width: "82%" }}
          icon={() => <IconButton icon="calendar" />}
        />
        {/* Floating button */}
        <TouchableOpacity style={styles.fab} onPress={toggleModalAdd}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dataWork}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ItemListWork item={item} />}
        style={{ marginBottom: "21%" }}
      />

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
              placeholder="Chọn công việc"
              placeholderStyle={{ marginStart: 10 }}
              containerStyle={{ borderRadius: 5 }}
              selectedTextStyle={{ marginStart: 10 }}
              style={styles.dropdown}
            />

            <TextInput
              label="Chọn thời gian làm việc"
              mode="outlined"
              style={styles.textInput}
            />

            <Dropdown
              search
              searchPlaceholder="Tìm kiếm..."
              valueField="value"
              labelField="label"
              data={dataTypeWork.map((item) => ({
                value: item._id,
                label: item.name,
              }))}
              placeholder="Chọn nhân viên"
              placeholderStyle={{ marginStart: 10 }}
              containerStyle={{ borderRadius: 5 }}
              selectedTextStyle={{ marginStart: 10 }}
              style={styles.dropdown}
            />

            <TextInput
              label="Địa điểm làm việc"
              mode="outlined"
              style={styles.textInput}
            />
            <TextInput
              label="Ghi chú"
              mode="outlined"
              style={styles.textInput}
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
              // onPress={updateService}
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
