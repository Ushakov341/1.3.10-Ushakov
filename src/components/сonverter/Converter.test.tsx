import { renderWithRedux } from "../../test/utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Converter from "./Converter";
import { describe, it, expect, beforeEach } from "vitest";

describe("Converter component", () => {
  beforeEach(() => {
    renderWithRedux(<Converter />);
  });

  it("отображает левый инпут со значением 100 при первом рендеринге", () => {
    const leftInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    expect(leftInput).toBeInTheDocument();
    expect(leftInput).toHaveValue(100);
  });

  it("отображает правый инпут, который недоступен для редактирования", () => {
    const rightInput = screen.getByLabelText(/converted amount/i) as HTMLInputElement;
    expect(rightInput).toBeInTheDocument();
    expect(rightInput).toBeDisabled();
  });

  it("отображает два селекта валют", () => {
    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(selects).toHaveLength(2);
  });

  it("отображает 6 карточек валют из мока", async () => {
    const currencyCards = await screen.findAllByTestId("currency-card");
    expect(currencyCards).toHaveLength(6);
  });

  it("если выбраны одинаковые валюты, курс равен 1 и результат равен левому значению", () => {
    const leftInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    const rightInput = screen.getByLabelText(/converted amount/i) as HTMLInputElement;

    expect(leftInput).toHaveValue(100);
    expect(rightInput).toHaveValue(100);
  });

  it("изменение значения в левом инпуте обновляет значение в правом", () => {
    const leftInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    const rightInput = screen.getByLabelText(/converted amount/i) as HTMLInputElement;

    fireEvent.change(leftInput, { target: { value: "200" } });
    expect(rightInput.value).not.toBe("100");
  });

  it("попытка редактировать правый инпут не приводит к изменению", () => {
    const rightInput = screen.getByLabelText(/converted amount/i) as HTMLInputElement;
    fireEvent.change(rightInput, { target: { value: "999" } });
    expect(rightInput).not.toHaveValue(999);
  });

  it("смена валют в селектах влияет на результат", async () => {
    const leftInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    const rightInput = screen.getByLabelText(/converted amount/i) as HTMLInputElement;
    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];

    // Меняем валюту "из"
    fireEvent.change(selects[0], { target: { value: "EUR" } });

    // Меняем валюту "в"
    fireEvent.change(selects[1], { target: { value: "JPY" } });

    fireEvent.change(leftInput, { target: { value: "50" } });

    await waitFor(() => {
      expect(rightInput.value).not.toBe("50"); // Значение должно пересчитаться
    });
  });

  it("по умолчанию выбраны правильные валюты из currencyResponse", () => {
    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    expect(selects[0]).toHaveDisplayValue(/USD/i);
    expect(selects[1]).toHaveDisplayValue(/USD/i);
  });

  it("ввод нечислового значения в левый инпут не ломает приложение", () => {
    const leftInput = screen.getByLabelText(/amount/i) as HTMLInputElement;
    fireEvent.change(leftInput, { target: { value: "abc" } });
    expect(leftInput.value).toBe("abc");
    // Приложение не должно падать, правое значение просто не обновляется
  });
});
