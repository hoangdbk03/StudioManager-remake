import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import AxiosIntance from "../util/AxiosIntance";
import Toast from "react-native-toast-message";
import Modal from "react-native-modal";
import { TextInput } from "react-native-paper";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { AppConText } from "../util/AppContext";
import { styleModal } from "../style/styleModal";
import ItemListClientAdmin from "./ItemListClientAdmin";
import { Searchbar } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import unorm from "unorm";

const genderOptions = [
  { label: "Nam", value: "1" },
  { label: "Nữ", value: "2" },
  { label: "Khác", value: "3" },
];

const ManagerClient = () => {
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [data, setdata] = useState([]);
  const { inforUser } = useContext(AppConText);
  const [selectedGender, setSelectedGender] = useState("");
  const [refreshing, setrefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const onChangeSearch = (query) => setSearchQuery(query);
  // Chuẩn hóa chuỗi sang Unicode NFD
  const normalizedSearchQuery = unorm.nfkd(searchQuery.toLowerCase());

  // Lọc dữ liệu dựa trên chuỗi tìm kiếm đã được chuẩn hóa
  const filteredData = data.filter((item) => {
    const normalizedDataName = unorm.nfkd(item.name.toLowerCase());
    const normalizedDataPhone = unorm.nfkd(item.phone.toLowerCase());

    return (
      normalizedDataName.includes(normalizedSearchQuery) ||
      normalizedDataPhone.includes(normalizedSearchQuery)
    );
  });

  //lưu giá trị được thêm
  const [addData, setaddData] = useState({
    name: "",
    address: "",
    phone: "",
    phone2: "",
    creatorID: inforUser._id,
  });

  //lưu giá trị cập nhật
  const [editedData, setEditedData] = useState({
    name: "",
    address: "",
    phone: "",
    phone2: "",
  });

  //ẩn modal
  const toggleAddModal = () => {
    setAddModalVisible(!isAddModalVisible);
    setSelectedGender("");
  };
  const toggleUpdateModal = () => {
    setUpdateModalVisible(!isUpdateModalVisible);
  };

  //lấy danh sách khách hàng
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get("/client/list/");
      const apiData = response.filter(item => item.disable === false);
      setdata(apiData);
      setrefreshing(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Đã xảy ra lỗi",
      });
      setrefreshing(false);
    }
  };
  // load lại data
  const handleRefreshData = async() => {
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

  // xử lý thêm dữ liệu
  const handleAddClient = async () => {
    if (
      addData.name.trim() === "" ||
      addData.address.trim() === "" ||
      addData.phone.trim() === "" ||
      addData.phone2.trim() === "" ||
      selectedGender.trim() === ""
    ) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
    } else {
      try {
        await AxiosIntance().post("/client/create", {
          ...addData,
          gender: selectedGender,
        });
        Toast.show({
          type: "success",
          text1: "Thêm thành công",
        });
        toggleAddModal();
        fetchData();
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Thêm thất bại",
        });
      }
    }
  };

  // xử lý cập nhật dữ liệu
  const handleUpdateItem = async () => {
    if (
      editedData.name.trim() === "" ||
      editedData.address.trim() === "" ||
      editedData.phone.trim() === "" ||
      editedData.phone2.trim() === "" ||
      selectedGender.trim() === ""
    ) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
    } else {
      try {
        await AxiosIntance().put("/client/update/" + editedData._id, {
          ...editedData,
          gender: selectedGender,
        });
        Toast.show({
          type: "success",
          text1: "Cập nhật thành công",
        });
        fetchData(); // Cập nhật danh sách dữ liệu sau khi cập nhật
        toggleUpdateModal();
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Cập nhật thất bại",
        });
      }
    }
  };

  //xử lý xóa dữ liệu
  const handleDeleteItem = async (itemId) => {
    try {
      const disable = {
        disable: true
      }
      await AxiosIntance().put("/client/update/" + itemId, disable);
      Toast.show({
        type: "success",
        text1: "Xóa thành công",
      });
      fetchData(); // Cập nhật danh sách dữ liệu sau khi xóa
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Xóa thất bại",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //phần front-end
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <Searchbar
          placeholder="Tìm kiếm"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={{ borderRadius: 10, width: "82%" }}
        />
        {/* Floating button */}
        <TouchableOpacity style={styles.fab} onPress={toggleAddModal}>
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        refreshing={refreshing}
        onRefresh={handleRefreshData}
        initialNumToRender={5} // Số lượng mục hiển thị ban đầu
        onEndReached={fetchData}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            onPress={() => {
              setEditedData({ ...item });
              setSelectedGender(item.gender);
              toggleUpdateModal();
            }}
          >
            <ItemListClientAdmin
              item={item}
              index={index}
              onDelete={handleDeleteItem}
            />
          </TouchableOpacity>
        )}
      />

      {/* Modal thêm thông tin khách hàng mới */}
      <Modal isVisible={isAddModalVisible} style={styleModal.modalContainer}>
        <View>
          <View style={styleModal.modalContent}>
            <View style={styleModal.frameTitleModal}>
              <Text style={styleModal.titleModal}>Thêm khách hàng mới</Text>
            </View>

            {/* Tạo các TextInput để thêm mới*/}
            <TextInput
              style={styleModal.textInput}
              onChangeText={(text) => setaddData({ ...addData, name: text })}
              mode="outlined"
              label="Họ và tên"
            />
            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={[styleModal.textInput, { width: "58%", marginEnd: 5 }]}
                onChangeText={(text) => setaddData({ ...addData, phone: text })}
                mode="outlined"
                label="Số điện thoại"
                keyboardType="numeric"
              />
              <Dropdown
                style={styles.dropdown}
                placeholder="Giới tính"
                labelField="label"
                valueField="value"
                data={genderOptions}
                value={selectedGender}
                onChange={(item) => {
                  setSelectedGender(item.label);
                }}
              />
            </View>

            <TextInput
              style={styleModal.textInput}
              onChangeText={(text) => setaddData({ ...addData, phone2: text })}
              mode="outlined"
              label="Số điện thoại phụ"
              keyboardType="numeric"
            />
            <TextInput
              style={styleModal.textInput}
              onChangeText={(text) => setaddData({ ...addData, address: text })}
              mode="outlined"
              label="Địa chỉ"
            />
            <View style={styleModal.buttonModal}>
              <TouchableOpacity
                onPress={toggleAddModal}
                style={styleModal.button1}
              >
                <Text style={styleModal.textButton1}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddClient}
                style={styleModal.button2}
              >
                <Text style={styleModal.textButton2}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal chỉnh sửa thông tin */}
      <Modal isVisible={isUpdateModalVisible} style={styleModal.modalContainer}>
        <View>
          <View style={styleModal.modalContent}>
            <View style={styleModal.frameTitleModal}>
              <Text style={styleModal.titleModal}>Cập nhật khách hàng</Text>
            </View>
            {/* Tạo các TextInput để chỉnh sửa thông tin ở đây */}
            <TextInput
              style={styleModal.textInput}
              value={editedData.name}
              onChangeText={(text) =>
                setEditedData({ ...editedData, name: text })
              }
              mode="outlined"
              label="Họ và tên"
            />
            <View style={{ flexDirection: "row" }}>
              <TextInput
                style={[styleModal.textInput, { width: "58%", marginEnd: 5 }]}
                value={editedData.phone}
                onChangeText={(text) =>
                  setEditedData({ ...editedData, phone: text })
                }
                mode="outlined"
                label="Số điện thoại"
                keyboardType="numeric"
              />
              <Dropdown
                style={styles.dropdown}
                placeholder={selectedGender || "Giới tính"}
                labelField="label"
                valueField="value"
                data={genderOptions}
                value={selectedGender}
                onChange={(item) => {
                  setSelectedGender(item.label);
                }}
              />
            </View>
            <TextInput
              style={styleModal.textInput}
              value={editedData.phone2}
              onChangeText={(text) =>
                setEditedData({ ...editedData, phone2: text })
              }
              mode="outlined"
              label="Số điện thoại phụ"
              keyboardType="numeric"
            />
            <TextInput
              style={styleModal.textInput}
              value={editedData.address}
              onChangeText={(text) =>
                setEditedData({ ...editedData, address: text })
              }
              mode="outlined"
              label="Địa chỉ"
            />
            <View style={styleModal.buttonModal}>
              <TouchableOpacity
                onPress={toggleUpdateModal}
                style={styleModal.button1}
              >
                <Text style={styleModal.textButton1}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateItem}
                style={styleModal.button2}
              >
                <Text style={styleModal.textButton2}>Cập nhật</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManagerClient;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 5,
    width: "100%",
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
  dropdown: {
    width: "30%",
    height: 50,
    borderColor: "#545454",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: "#f7fbff",
    marginTop: 16,
  },
});
