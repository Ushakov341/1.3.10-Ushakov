import { screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { renderWithRedux } from "../../test/utils";
import App from "../app/App";

const ALL_CURRENCIES = ['USD', 'EUR', 'KZT', 'CAD', 'JPY'];

describe ('Converter functional', () => {
//1
  it ('renders all main elements and initial state', () => {
    renderWithRedux(<App />);
    expect(screen.getByText(/Конвертер валют онлайн/i)).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getByText("У меня есть")).toBeInTheDocument();
    expect(screen.getByText("Хочу приобрести")).toBeInTheDocument();
    const [leftInput, rightInput] = screen.getAllByRole('spinbutton');
    expect(leftInput).toHaveValue(100);
    expect(rightInput).toBeDisabled();
  });
//2
  it('shows all available currencies in both switchers', async () => {
    renderWithRedux(<App />);
    await screen.findAllByText('USD');
    for (const code of ALL_CURRENCIES) {
      expect(screen.getAllByText(code)).toHaveLength(2);
    }
  });
//3
  it('recalculater right input when left input changes', () => {
    renderWithRedux (<App />);
    const [leftInput, rightInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(leftInput, { target: { value: '200' } });
    expect(Number((rightInput as HTMLInputElement).value)).toBeCloseTo(2.15, 1);
  });
//4
  it('changes left currency and updates rate and value', async () => {
    renderWithRedux(<App />);
    await screen.findAllByText('EUR');
    const rightInput = screen.getAllByRole("spinbutton")[1];
    fireEvent.click(screen.getAllByText('EUR')[0]);
    expect(Number((rightInput as HTMLInputElement).value)).toBeCloseTo(213.11, 1);
    expect(screen.getByText(/1 EUR = 1.07 USD/)).toBeInTheDocument();
  });
//5
  it('changes right currency and updates rate and value', async () => {
    renderWithRedux(<App />);
    await screen.findAllByText('CAD');
    fireEvent.click(screen.getAllByText('CAD')[1]);
    const rightInput = screen.getAllByRole("spinbutton")[1] as HTMLInputElement;
    expect(Number(rightInput.value)).toBeCloseTo(145.48, 1);
    expect(screen.getAllByText((content) => content.includes('1 CAD ='))).toBeTruthy();
  });
//6
  it('shows rate 1 and same value for identical currencies', async () => {
    renderWithRedux(<App />);
    await screen.findAllByText('USD');
    fireEvent.click(screen.getAllByText('USD')[1]);
    const [leftInput, rightInput] = screen.getAllByRole('spinbutton');
    expect(Number((rightInput as HTMLInputElement).value)).toBeCloseTo(
      Number((leftInput as HTMLInputElement).value),
      2
    );
    expect(screen.getAllByText(/1 USD = 1.00 USD/).length).toBeGreaterThan(0);
  });
//7
  it('swaps currencies and recalculates values on reverse click', async () => {
    renderWithRedux(<App />);
    const [leftInput, rightInput] = screen.getAllByRole('spinbutton');
    await screen.findAllByText('USD');
    fireEvent.click(screen.getAllByText('USD')[0]);
    fireEvent.click(screen.getAllByText('EUR')[1]);
    fireEvent.change(leftInput, { target: { value: '50' } });
    expect(Number((rightInput as HTMLInputElement).value)).toBeCloseTo(53.28, 1);
    const reverseButton = document.querySelector('.direction__reverse');
    expect(reverseButton).not.toBeNull();
    if (reverseButton) {
      fireEvent.click(reverseButton);
    }

    expect((leftInput as HTMLInputElement).value).toBe('50');
    expect(Number((rightInput as HTMLInputElement).value)).toBeCloseTo(46.92, 1);
  });
//8
  it('right input is always disabled', async () => {
    renderWithRedux(<App />);
    await screen.findAllByText('USD');
    const rightInput = screen.getAllByRole('spinbutton')[1];
    expect(rightInput).toBeDisabled();
    fireEvent.click(screen.getAllByText('EUR')[1]);
    expect(rightInput).toBeDisabled();
  });
//9
  it('clear both fields when left input is cleared', () => {
    renderWithRedux(<App />);
    const [leftInput, rightInput] = screen.getAllByRole('spinbutton');
    fireEvent.change(leftInput, { target: { value: '' } });
    expect(leftInput).toHaveValue(null);
    expect(rightInput).toHaveValue(null);
  });
});