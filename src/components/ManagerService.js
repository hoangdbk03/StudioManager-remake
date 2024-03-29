import {
  Alert,
  Button,
  Image,
  Platform,
  StyleSheet,
  ToastAndroid,
  TouchableHighlight,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-paper";
import React, { useContext, useEffect, useState } from "react";
import { FlatList } from "react-native-gesture-handler";
import AxiosIntance from "../util/AxiosIntance";
import Toast from "react-native-toast-message";
import ItemListService from "./ItemListService";
import { Badge } from "react-native-paper";
import Feather from "react-native-vector-icons/Feather";
import { AppConText } from "../util/AppContext";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Modal from "react-native-modal";
import { Text } from "react-native";
import { styleModal } from "../style/styleModal";
import * as ImagePicker from "expo-image-picker";
import SpinnerOverlay from "../items/SpinnerOverlay";

const ManagerService = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigation();
  const [numColumns, setNumColumns] = useState(2);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { inforUser } = useContext(AppConText);
  const [imageUri, setImageUri] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);

  // ! Modal
  const [isModalAdd, setModalAdd] = useState(false);
  const [isModalUpdate, setModalUpdate] = useState(false);
  const [isModalDel, setModalDel] = useState(false);
  const [isModalDetail, setModalDetail] = useState(false);

  // * định dạng lại tiền việt
  const formatCurrency = (amount) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formatter.format(amount);
  };

  // * lưu trữ dữ liệu thêm
  const [dataAdd, setDataAdd] = useState({
    name: "",
    description: "",
    price: "",
  });
  // * lưu trữ dữ liệu cập nhật
  const [dataEdit, setDataEdit] = useState({
    name: "",
    description: "",
    price: "",
  });
  // * hiển thị modal thêm dịch vụ
  const toggleModalAdd = () => {
    setModalAdd(!isModalAdd);
    if (!isModalAdd) {
      setImageUri(null);
      setDataAdd({
        name: "",
        description: "",
        price: "",
      });
    }
  };
  // * hiển thị modal cập nhật dịch vụ
  const toggleModalUpdate = () => {
    setModalUpdate(!isModalUpdate);
    if (!isModalUpdate) {
      setImageUri(null);
    }
  };
  // * hiển thị modal xác nhận xóa
  const toggleModalDel = (item) => {
    setModalDel(!isModalDel);
    setSelectedItem(item);
  };
  // * hiển thị modal chi tiết dịch vụ
  const handleModalDetail = (item) => {
    setSelectedItemForModal(item);
    setModalDetail(true);
  };
  // * đóng modal chi tiết dịch vụ
  const handleCloseModalDetail = () => {
    setModalDetail(false);
  };

  /**
   * TODO: Xử lý API
   */

  // TODO: xử lý thêm dịch vụ
  // * Mở thư viện chọn hình ảnh
  const openImageLibrary = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setDataAdd({ ...dataAdd, image: result.assets[0].uri });
      setSelectedItem((prevItem) => ({
        ...prevItem,
        image: result.assets[0].uri,
      }));
      setDataEdit((prevDataEdit) => ({
        ...prevDataEdit,
        image: result.assets[0].uri,
      }));
    }
  };
  // * xử lý api thêm
  const addService = async () => {
    try {
      setLoading(true);
      // Create FormData object
      const formData = new FormData();
      formData.append("name", dataAdd.name);
      formData.append("description", dataAdd.description);
      formData.append("price", dataAdd.price);

      // Kiểm tra xem hình ảnh có được chọn hay không trước khi thêm vào FormData
      if (imageUri) {
        const imageUriParts = imageUri.split(".");
        const imageFileType = imageUriParts[imageUriParts.length - 1];
        const imageName = `service_image_${Date.now()}.${imageFileType}`;
        formData.append("image", {
          uri: imageUri,
          name: imageName,
          type: `image/${imageFileType}`,
        });
      }

      // validate
      if (!dataAdd.name || !dataAdd.price) {
        Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      await AxiosIntance().post("/service/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      Toast.show({
        type: "success",
        text1: "Thêm thành công.",
      });
      setLoading(false);
      toggleModalAdd();
      fetchData();
    } catch (error) {
      setLoading(false);
      toggleModalAdd();
      console.log("Add Service Error: ", error);
      Toast.show({
        type: "error",
        text1: "Thêm thất bại.",
      });
    }
  };
  // TODO: Xử lý API cập nhật dịch vụ
  const updateService = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("name", dataEdit.name);
      formData.append("description", dataEdit.description);
      formData.append("price", dataEdit.price);
      // Kiểm tra xem hình ảnh có được chọn hay không trước khi thêm vào FormData
      if (imageUri) {
        const imageUriParts = imageUri.split(".");
        const imageFileType = imageUriParts[imageUriParts.length - 1];
        const imageName = `service_image_${Date.now()}.${imageFileType}`;
        formData.append("image", {
          uri: imageUri,
          name: imageName,
          type: `image/${imageFileType}`,
        });
      }

      // validate
      if (!dataEdit.name || !dataEdit.price) {
        Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin!");
        return;
      }

      await AxiosIntance().put(
        `/service/update/${selectedItem._id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      Toast.show({
        type: "success",
        text1: "Cập nhật thành công",
      });
      setLoading(false);
      toggleModalUpdate();
      fetchData();
    } catch (error) {
      setLoading(false);
      toggleModalUpdate();
      console.log("Update error", error);
      Toast.show({
        type: "error",
        text1: "Cập nhật thất bại!",
      });
    }
  };
  // TODO: APi xóa dịch vụ theo id
  const deleteService = async (serviceId) => {
    try {
      setLoading(true);
      await AxiosIntance().delete(`/service/delete/${serviceId}`);
      Toast.show({
        type: "success",
        text1: "Xóa thành công dịch vụ",
      });
      setLoading(false);
      fetchData();
    } catch (error) {
      setLoading(false);
      Toast.show({
        type: "error",
        text1: "Xóa thất bại",
      });
    }
  };
  const handleEditService = (item) => {
    setSelectedItem(item);
    toggleModalUpdate();
  };
  const handleDeleteService = () => {
    deleteService(selectedItem._id);
    toggleModalDel();
  };

  // TODO: Xử lý API lấy danh sách dịch vụ
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get("/service/list");
      const apiData = response;
      setData(apiData);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Không lấy được dữ liệu",
      });
    }
  };

  useEffect(() => {
    if (selectedItem) {
      setDataEdit({
        name: selectedItem.name || "",
        description: selectedItem.description || "",
        price: selectedItem.price ? selectedItem.price.toString() : "",
      });
    }
  }, [selectedItem]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <SpinnerOverlay visible={loading}/>
      <FlatList
        data={data}
        numColumns={numColumns}
        initialNumToRender={5} // Số lượng mục hiển thị ban đầu
        onEndReached={fetchData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ItemListService
            item={item}
            onAddToCart={() => handleAddToCart()}
            onRemoveFromCart={() => handleRemoveFromCart()}
            onEdit={handleEditService}
            onDelete={(item) => {
              toggleModalDel();
              setSelectedItem(item);
            }}
            onModal={(item) => handleModalDetail(item)}
          />
        )}
      />
      {inforUser.role === "Nhân viên" ? null : (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.floatingAdd}
          onPress={toggleModalAdd}
        >
          <MaterialIcons name="add" size={30} color="white" />
        </TouchableOpacity>
      )}

      {/* Modal thêm dịch vụ */}
      <Modal isVisible={isModalAdd} style={styleModal.modalContainer}>
        <View style={styleModal.modalContent}>
          <View style={styles.frameImage}>
            <TouchableNativeFeedback onPress={() => openImageLibrary()}>
              {imageUri ? (
                <Image style={styles.imgAdd} source={{ uri: imageUri }} />
              ) : (
                <Image
                  style={styles.imgAddNull}
                  source={require("../img/frame-add.png")}
                />
              )}
            </TouchableNativeFeedback>
          </View>

          <TextInput
            style={styleModal.textInput}
            onChangeText={(text) => setDataAdd({ ...dataAdd, name: text })}
            mode="outlined"
            label="Tên dịch vụ"
          />

          <TextInput
            style={styleModal.textInput}
            onChangeText={(text) => {
              setDataAdd({ ...dataAdd, price: text.replace(/[^0-9]/g, "") });
            }}
            mode="outlined"
            label="Giá tiền"
            keyboardType="numeric"
            value={formatCurrency(dataAdd.price)}
          />

          <TextInput
            style={styleModal.textInput}
            onChangeText={(text) =>
              setDataAdd({ ...dataAdd, description: text })
            }
            mode="outlined"
            label="Mô tả..."
            multiline={true}
            numberOfLines={6}
          />

          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalAdd}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addService} style={styleModal.button2}>
              <Text style={styleModal.textButton2}>Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal cập nhật dịch vụ */}
      <Modal isVisible={isModalUpdate} style={styleModal.modalContainer}>
        <View style={styleModal.modalContent}>
          <TouchableNativeFeedback onPress={() => openImageLibrary()}>
            <View style={styles.frameImage}>
              <Image
                style={styles.imgAdd}
                source={{
                  uri: selectedItem ? selectedItem.image : null,
                }}
              />
            </View>
          </TouchableNativeFeedback>

          <TextInput
            style={styleModal.textInput}
            value={dataEdit.name}
            onChangeText={(text) => setDataEdit({ ...dataEdit, name: text })}
            mode="outlined"
            label="Tên dịch vụ"
          />

          <TextInput
            style={styleModal.textInput}
            value={formatCurrency(dataEdit.price)}
            onChangeText={(text) =>
              setDataEdit({ ...dataEdit, price: text.replace(/[^0-9]/g, "") })
            }
            mode="outlined"
            label="Giá tiền"
            keyboardType="numeric"
          />

          <TextInput
            style={[styleModal.textInput, { marginBottom: 10 }]}
            value={dataEdit.description}
            onChangeText={(text) =>
              setDataEdit({ ...dataEdit, description: text })
            }
            mode="outlined"
            label="Mô tả..."
            multiline={true}
            numberOfLines={6}
          />

          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalUpdate}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={updateService}
              style={styleModal.button2}
            >
              <Text style={styleModal.textButton2}>Cập nhật</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal chi tiết dịch vụ */}
      <Modal isVisible={isModalDetail} style={styleModal.modalContainer}>
        <View style={styleModal.modalContent}>
          <TouchableOpacity
            onPress={handleCloseModalDetail}
            activeOpacity={1}
            style={{ width: "100%", alignItems: "flex-end", right: 10 }}
          >
            <Feather name="x" size={40} />
          </TouchableOpacity>
          {selectedItemForModal && (
            <>
              <View style={styles.frameImage}>
                <Image
                  style={styles.imgAdd}
                  source={{ uri: selectedItemForModal.image }}
                />
              </View>
              <TextInput
                style={styleModal.textInput}
                value={selectedItemForModal.name}
                editable={false}
                mode="outlined"
                label="Tên dịch vụ"
              />
              {inforUser.role == !"Nhân viên" && (
                <TextInput
                  style={styleModal.textInput}
                  value={formatCurrency(selectedItemForModal.price)}
                  editable={false}
                  mode="outlined"
                  label="Giá tiền"
                />
              )}

              <TextInput
                style={[styleModal.textInput, { marginBottom: 10 }]}
                value={selectedItemForModal.description}
                editable={false}
                mode="outlined"
                label="Mô tả..."
                multiline={true}
                numberOfLines={6}
              />
            </>
          )}
        </View>
      </Modal>

      {/* Modal xóa */}
      <Modal isVisible={isModalDel} style={styleModal.modalContainer}>
        <View style={styleModal.modalContent}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              padding: 10,
            }}
          >
            <Text style={styles.textCofirm}>
              Bạn chắc chắn muốn xóa dịch vụ?
            </Text>
            <Text style={{ fontSize: 15 }}>
              {selectedItem ? selectedItem.name : ""}
            </Text>
          </View>
          <View style={styleModal.buttonModal}>
            <TouchableOpacity
              onPress={toggleModalDel}
              style={styleModal.button1}
            >
              <Text style={styleModal.textButton1}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteService}
              style={styleModal.button2}
            >
              <Text style={styleModal.textButton2}>Đồng ý</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManagerService;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  floatingAdd: {
    position: "absolute",
    bottom: 100,
    right: 20,
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    width: 56,
    height: 56,
    backgroundColor: "#0E55A7",
  },
  imgAddNull: {
    width: 80,
    height: 80,
  },
  imgAdd: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  frameImage: {
    width: 200,
    height: 200,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7fbff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  textCofirm: {
    color: "#fc6261",
    fontSize: 15,
    fontWeight: "bold",
  },
});
