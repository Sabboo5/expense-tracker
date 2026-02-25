import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from '@/components/ui/Pagination';
import { PaginationMeta } from '@/types';

const makePagination = (overrides: Partial<PaginationMeta> = {}): PaginationMeta => ({
  total: 100,
  page: 1,
  limit: 10,
  totalPages: 10,
  hasNextPage: true,
  hasPrevPage: false,
  ...overrides,
});

describe('Pagination Component', () => {
  it('renders pagination when totalPages > 1', () => {
    render(<Pagination pagination={makePagination()} onPageChange={vi.fn()} />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('does not render when totalPages is 1', () => {
    const { container } = render(
      <Pagination
        pagination={makePagination({ totalPages: 1, total: 5 })}
        onPageChange={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('shows correct result range text', () => {
    render(<Pagination pagination={makePagination({ page: 2 })} onPageChange={vi.fn()} />);
    expect(screen.getByText(/showing/i)).toBeInTheDocument();
  });

  it('calls onPageChange with next page when next button clicked', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        pagination={makePagination({ page: 1, hasNextPage: true })}
        onPageChange={handleChange}
      />
    );
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with prev page when prev button clicked', () => {
    const handleChange = vi.fn();
    render(
      <Pagination
        pagination={makePagination({ page: 3, hasPrevPage: true })}
        onPageChange={handleChange}
      />
    );
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('disables prev button on first page', () => {
    render(
      <Pagination
        pagination={makePagination({ page: 1, hasPrevPage: false })}
        onPageChange={vi.fn()}
      />
    );
    const prevBtn = screen.getByLabelText('Previous page');
    expect(prevBtn).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <Pagination
        pagination={makePagination({ page: 10, hasNextPage: false, hasPrevPage: true })}
        onPageChange={vi.fn()}
      />
    );
    const nextBtn = screen.getByLabelText('Next page');
    expect(nextBtn).toBeDisabled();
  });

  it('highlights the current page', () => {
    render(
      <Pagination
        pagination={makePagination({ page: 3, hasPrevPage: true })}
        onPageChange={vi.fn()}
      />
    );
    const currentPage = screen.getByRole('button', { current: 'page' });
    expect(currentPage.textContent).toBe('3');
  });
});
