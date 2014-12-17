package io.riots.core.handlers.query;

/**
 * @author omoser
 */
public class Paged {

    private final int page;

    private final int size;

    public static final int DEFAULT_SIZE = 10;

    public Paged(int page, int size) {
        this.page = page;
        if (size <= 0) {
            this.size = DEFAULT_SIZE;
        } else {
            this.size = size;
        }
    }

    public int getPage() {
        return page;
    }

    public int getSize() {
        return size;
    }

    @Override
    public String toString() {
        return "PageRequest{" +
                "page=" + page +
                ", size=" + size +
                '}';
    }

    public boolean isValid() {
        return page >= 0 && size > 0; // todo seems ugly, might even be incorrect
    }
}
