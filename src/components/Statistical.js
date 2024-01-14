import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { PieChart } from "react-native-chart-kit";
import AxiosIntance from "../util/AxiosIntance";
import { Dropdown } from "react-native-element-dropdown";
import SpinnerOverlay from "../items/SpinnerOverlay";

const optionsMonth = [
  { label: "Tháng 1", value: "1" },
  { label: "Tháng 2", value: "2" },
  { label: "Tháng 3", value: "3" },
  { label: "Tháng 4", value: "4" },
  { label: "Tháng 5", value: "5" },
  { label: "Tháng 6", value: "6" },
  { label: "Tháng 7", value: "7" },
  { label: "Tháng 8", value: "8" },
  { label: "Tháng 9", value: "9" },
  { label: "Tháng 10", value: "10" },
  { label: "Tháng 11", value: "11" },
  { label: "Tháng 12", value: "12" },
];

const Statistical = () => {
  const [data, setData] = useState([]);
  const [dataOutfit, setDataOutfit] = useState([]);
  const [loading, setLoading] = useState(false);

  // * tiêu đề
  const [monthLabel, setMonthLabel] = useState("");
  const [yearLabel, setYearLabel] = useState("");

  // * giá trị truyền vào api
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const currentYear = new Date().getFullYear();
  const startYear = 2023; // Năm bắt đầu

  const optionsYear = [];

  for (let year = startYear; year <= currentYear + 1; year++) {
    optionsYear.push({ label: year.toString(), value: year.toString() });
  }

  const [totalPirceByDate, setTotalPirceByDate] = useState(0);

  useEffect(() => {
    fetchDataOutfit();
    fetchDataStatistic();
  }, []);

  // TODO: lấy danh sách dịch vụ sử dụng nhiều
  const fetchDataStatistic = async () => {
    try {
      const response = await AxiosIntance().get("/statistic/service-usage");
      setData(response);
    } catch (error) {
      console.log(data);
      console.log("Lỗi lấy danh sách dịch vụ sử dụng nhiều", error);
    }
  };

  // TODO: lấy danh sách trang phục sử dụng nhiều
  const fetchDataOutfit = async () => {
    try {
      const response = await AxiosIntance().get(
        "/statistic/wedding-outfit-usage"
      );
      setDataOutfit(response);
    } catch (error) {
      console.log("Lỗi lấy danh sách trang phục sử dụng nhiều", error);
    }
  };

  const getRandomColor = () => {
    const color = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    return color !== "#ffffff" ? color : getRandomColor(); // Recursively call the function if the color is white
  };

  const handleGetTotalByDate = async () => {
    setLoading(true);
    try {
      const response = await AxiosIntance().get(
        `/statistic/totalRevenue?month=${month}&year=${year}`
      );
      setTotalPirceByDate(response);
    } catch (error) {
      console.log("Lỗi lấy tổng doanh thu ở Statical", error);
    } finally {
      setLoading(false);
    }
  };

  // * định dạng lại tiền việt
  const formatCurrency = (amount) => {
    const formatter = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formatter.format(amount);
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <SpinnerOverlay visible={loading} />
        <View
          style={{ flexDirection: "row", padding: 20, alignItems: "center" }}
        >
          <Dropdown
            style={styles.dropdown}
            labelField="label"
            valueField="value"
            data={optionsMonth}
            placeholder={monthLabel || "Tháng"}
            placeholderStyle={{ marginStart: 10 }}
            value={monthLabel}
            onChange={(item) => {
              setMonth(item.value);
              setMonthLabel(item.label);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            labelField="label"
            valueField="value"
            data={optionsYear}
            placeholder={yearLabel || "Năm"}
            placeholderStyle={{ marginStart: 10 }}
            onChange={(item) => {
              setYear(item.value);
              setYearLabel(item.label);
            }}
          />
        </View>
        <Text
          style={{
            padding: 10,
            color: "white",
            backgroundColor: "#0E55A7",
            borderRadius: 5,
            width: "80%",
            textAlign: "center",
            marginBottom: 10,
          }}
          onPress={handleGetTotalByDate}
        >
          Thống kê
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "500" }}>
          Tổng tiền: {formatCurrency(totalPirceByDate.revenue || 0)}
        </Text>

        <Text style={styles.titleStatical}>Hiệu suất sử dụng dịch vụ</Text>
        {data.length > 0 && (
          <PieChart
            data={data.map((item) => ({
              name: item.name,
              count: item.count,
              color: getRandomColor(),
            }))}
            width={400}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
        <Text style={styles.titleStatical}>Hiệu suất sử dụng trang phục</Text>
        {dataOutfit.length > 0 && (
          <PieChart
            data={dataOutfit.map((item) => ({
              name: item.name,
              count: item.count,
              color: getRandomColor(),
            }))}
            width={400}
            height={250}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        )}
      </View>
    </ScrollView>
  );
};

export default Statistical;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  titleStatical: {
    marginTop: 60,
    fontWeight: "500",
    fontSize: 18,
  },
  dropdown: {
    height: 50,
    width: "40%",
    borderWidth: 1,
    borderColor: "#8a8a8a",
    borderRadius: 5,
    margin: 5,
  },
});
