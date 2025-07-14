import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DateInput from '@/components/ui/DateInput';

describe('DateInput', () => {
  it('renders as a text input with YYYY-MM-DD format', () => {
    render(<DateInput label="Test Date" value="" onChange={() => {}} />);
    
    const input = screen.getByLabelText('Test Date');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('maxLength', '10');
    expect(screen.getByText('Format: YYYY-MM-DD (e.g., 2023-12-25)')).toBeInTheDocument();
  });

  it('formats input as YYYY-MM-DD while typing', () => {
    const handleChange = vi.fn();
    render(<DateInput label="Test Date" value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Test Date');
    
    // Type "20231225"
    fireEvent.change(input, { target: { value: '20231225' } });
    
    // Should format to "2023-12-25"
    expect(handleChange).toHaveBeenCalled();
    const callArgs = handleChange.mock.calls[0][0];
    expect(callArgs.target.value).toBe('2023-12-25');
  });

  it('only allows numeric input', () => {
    const handleChange = vi.fn();
    render(<DateInput label="Test Date" value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Test Date');
    
    // Try to type letters
    fireEvent.keyDown(input, { key: 'a', keyCode: 65 });
    
    // Should prevent the event
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('displays existing date values correctly', () => {
    render(<DateInput label="Test Date" value="2023-12-25" onChange={() => {}} />);
    
    const input = screen.getByLabelText('Test Date');
    expect(input).toHaveValue('2023-12-25');
  });

  it('shows error message when provided', () => {
    render(
      <DateInput 
        label="Test Date" 
        value="" 
        onChange={() => {}} 
        error="Date is required"
      />
    );
    
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('shows required asterisk when required', () => {
    render(
      <DateInput 
        label="Test Date" 
        value="" 
        onChange={() => {}} 
        required
      />
    );
    
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows format hint when not focused and no value', () => {
    render(<DateInput label="Test Date" value="" onChange={() => {}} />);
    
    expect(screen.getByText('YYYY-MM-DD')).toBeInTheDocument();
  });

  it('handles partial input correctly', () => {
    const handleChange = vi.fn();
    render(<DateInput label="Test Date" value="" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Test Date');
    
    // Type "2023"
    fireEvent.change(input, { target: { value: '2023' } });
    
    expect(handleChange).toHaveBeenCalled();
    const callArgs = handleChange.mock.calls[0][0];
    expect(callArgs.target.value).toBe('2023-');
  });
});