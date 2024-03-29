import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useContext, useEffect, useMemo, useState } from "react";
import AxiosIntance from "../util/AxiosIntance";
import Toast from "react-native-toast-message";
import ItemListStaff from "./ItemListStaff";
import { AppConText } from "../util/AppContext";
import { Searchbar } from "react-native-paper";

const ManagerStaff = ({ route, navigation }) => {
  const [data, setdata] = useState([]);
  const [loading, setLoading] = useState(true);
  const { inforUser } = useContext(AppConText);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [refreshing, setRefreshing] = useState(false);

  const onChangeSearch = (query) => setSearchQuery(query);

  //
  const listPlaceholder = useMemo(() => {
    return Array.from({ length: 15 }).map((_) => null);
  }, []);

  // lấy danh sách user
  const fetchData = async () => {
    try {
      const response = await AxiosIntance().get("/user/list");
      const apiData = response;
      await new Promise((resolve) => setTimeout(resolve, 1000));

      apiData.sort((a, b) => {
        if (a.role === "Quản lý" && b.role !== "Quản lý") return -1;
        if (a.role !== "Quản lý" && b.role === "Quản lý") return 1;
        return 0;
      });

      setdata(apiData);
      setRefreshing(false);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lấy danh sách thất bại",
      });
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  };

  // alert xác nhận xóa
  const alertConfirm = (itemId) => {
    Alert.alert("Thông báo", "Bạn chắc chắn muốn vô hiệu hóa?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Vô hiệu hóa",
        onPress: () => {
          handleDelete(itemId);
        },
      },
    ]);
  };

  // gọi api xử lý xóa theo id
  const handleDelete = async (itemId) => {
    try {
      const disable = {
        disable: true
      }
      await AxiosIntance().put("/user/update/" + itemId, disable);
      Toast.show({
        type: "success",
        text1: "Vô hiệu hóa thành công",
      });
      fetchData(); // cập nhật lại dữ liệu sau khi xóa thành công
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Vô hiệu hóa thất bại",
      });
    }
  };

  // mở lại disable = false
  const turnOffDisable = async (itemId) => {
    try {
      const disable = {
        disable: false
      }
      await AxiosIntance().put("/user/update/" + itemId, disable);
      Toast.show({
        type: "success",
        text1: "Tắt vô hiệu hóa thành công",
      });
      fetchData(); // cập nhật lại dữ liệu sau khi xóa thành công
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Tắt vô hiệu hóa thất bại",
      });
    }
  };

  useEffect(() => {
    if (route.params?.refresh) {
      fetchData();
      navigation.setParams({ refresh: false });
    } else {
      fetchData();
    }
  }, [route.params?.refresh]);

  // lọc theo tên data
  const filteredData = data.filter(
    (item) =>
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  

  // load lại data
  const handleRefreshData = () => {
    setRefreshing(true);
    fetchData();
    Toast.show({
      type: "success",
      text1: "Cập nhật thành công",
    });
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Tìm kiếm"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      {loading ? (
        // Render Skeleton trong khi data đang load
        <FlatList
          initialNumToRender={5} // Số lượng mục hiển thị ban đầu
          onEndReached={fetchData}
          data={listPlaceholder}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => <ItemListStaff item={null} />}
        />
      ) : (
        <FlatList
          data={filteredData ?? listPlaceholder}
          keyExtractor={(item) => item._id}
          initialNumToRender={1} // Số lượng mục hiển thị ban đầu
          onEndReached={fetchData}
          refreshing={refreshing}
          onRefresh={handleRefreshData}
          renderItem={({ item }) => {
            if (
              inforUser.role === "Admin" &&
              (item.role === "Quản lý" || item.role === "Nhân viên")
            ) {
              return <ItemListStaff item={item} onDelete={alertConfirm} />;
            } else if (
              inforUser.role === "Quản lý" &&
              item.role === "Nhân viên"
            ) {
              return <ItemListStaff item={item} onDelete={alertConfirm} onTurnOffDisable={turnOffDisable} />;
            }
          }}
        />
      )}
    </View>
  );
};

export default ManagerStaff;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: "white",
    flex: 1,
  },
  searchBar: {
    borderRadius: 10,
  },
});
